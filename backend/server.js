const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const https = require('https');
const http = require('http');


app.use(cors());
app.use(express.json());
app.use('/imageCache', express.static(path.join(__dirname, 'data/cache/imageCache')));

const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

require('dotenv').config();
const LOCAL = 'mongodb://localhost/iotharvest';
const CLUSTER = process.env.MONGODB_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const USED_DB = CLUSTER;
const MAIL_SUBJECT = "Alerta IoT Harvest - Estado del Cultivo";
let currentUserEmail =  process.env.MAIL_FROM;

const USE_CLOUDINARY = true; // true para usar Cloudinary
const CLOUDINARY_COOLDOWN_SECONDS = 10; // Cooldown en segundos entre subidas
const IMAGES_CACHE_SIZE = 14;
let imagesCache = [];
let lastCloudinaryUpload = 0;


// --- CONEXIÓN A MONGODB  I CLOWDUDINARY---
const sensorSchema = new mongoose.Schema({
  temperatura: { type: Number, required: true },
  humedad_aire: { type: Number, required: true },
  humedad_suelo: { type: Number, required: true },
  status: { type: Number, required: true },
  timeServer: { type: Date, default: Date.now },
  isTestData: { type: Boolean, default: false }
}, { collection: 'sensorsData' });

const Sensor = mongoose.model('Sensor', sensorSchema);

// Conexión a MongoDB
mongoose.connect(USED_DB, {
  dbName: 'iotharvest'
})
  .then(() => {
    const dbType = USED_DB.includes('localhost') ? `${GREEN}Local${RESET}` : `${CYAN}Cluster${RESET}`;
    console.log(`Conectado a MongoDB [${dbType}]`);
  })
  .catch(err => console.error('Error al conectar:', err));

  // Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// --- CREAR CARPETAS SI NO EXISTEN ---
const dataDir = path.join(__dirname, 'data');
const imagesDir = path.join(dataDir, 'images');
const sensorsDir = path.join(dataDir, 'sensors');
const cacheDir = path.join(dataDir, 'cache');
const imageCacheDir = path.join(cacheDir, 'imageCache');
const mailDir = path.join(dataDir, 'mail');

[imagesDir, sensorsDir, cacheDir, imageCacheDir, mailDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});


// --- SENSORS CACHE Y SENSORS JSON ---
const SENSOR_CACHE_SIZE = 14;
const SENSOR_CACHE_FILE = path.join(cacheDir, 'sensorCache.json');
let sensorCache = [];
let sensorsJson = [];
let currentSensorsDate = getTodayDateString();
let currentSensorsFile = path.join(sensorsDir, `${currentSensorsDate}.json`);

// Cargar la caché desde el archivo al iniciar el servidor
let cacheNeedsInit = false;

if (fs.existsSync(SENSOR_CACHE_FILE)) {
  try {
    const cacheContent = fs.readFileSync(SENSOR_CACHE_FILE, 'utf8');
    if (cacheContent.trim().length === 0) {
      console.warn('[CACHE] sensorCache.json está vacío.');
      cacheNeedsInit = true;
    } else {
      sensorCache = JSON.parse(cacheContent);
      if (!Array.isArray(sensorCache) || sensorCache.length === 0) {
        console.warn('[CACHE] sensorCache.json no contiene datos.');
        cacheNeedsInit = true;
      }
    }
  } catch (err) {
    console.error('[CACHE] Error al leer sensorCache.json:', err);
    cacheNeedsInit = true;
  }
} else {
  cacheNeedsInit = true;
}

async function initSensorCache() {
  // Buscar el último archivo .json en /data/sensors/
  const files = fs.readdirSync(sensorsDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse(); // El más reciente primero

  let loaded = false;
  for (const file of files) {
    const filePath = path.join(sensorsDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        sensorCache = data.slice(-SENSOR_CACHE_SIZE);
        console.log(`[CACHE] sensorCache.json inicializado con datos de backend/data/sensors/${file}`);
        loaded = true;
        break;
      }
    } catch (err) {
      // Ignorar archivos corruptos
    }
  }

  // Si no hay archivos válidos, consulta MongoDB
  if (!loaded) {
    try {
      const Sensor = mongoose.model('Sensor');
      const datos = await Sensor.find().sort({ timeServer: -1 }).limit(SENSOR_CACHE_SIZE);
      sensorCache = datos.reverse().map(d => d.toObject());
      console.log('[CACHE] sensorCache.json inicializado con datos de MongoDB');
    } catch (err) {
      console.error('[CACHE] No se pudo inicializar la caché desde MongoDB:', err);
      sensorCache = [];
    }
  }

  // Guardar la caché inicializada
  try {
    fs.writeFileSync(SENSOR_CACHE_FILE, JSON.stringify(sensorCache, null, 2));
  } catch (err) {
    console.error('[CACHE] Error al guardar sensorCache.json:', err);
  }
}

// Llama a la inicialización si es necesario
if (cacheNeedsInit) {
  console.log('[CACHE] Inicializando sensorCache.json...');
  (async () => { await initSensorCache(); })();
}

// Inicializar imagesCache DESPUÉS de que las carpetas estén creadas
initializeImagesCache();

// Cargar solo el archivo de sensores del día actual
loadSensorsJsonForToday();

// Cargar los últimos datos de la caché en memoria
let cacheUltimosDatos = null;
function actualizarSensorCacheRam(datos) {
  cacheUltimosDatos = datos;
}
// Actualizar la caché de sensores y guardar en el archivo JSON
function actualizarSensorCache(nuevoDato) {
  sensorCache.push(nuevoDato);
  while (sensorCache.length > SENSOR_CACHE_SIZE) {
    sensorCache.shift();
  }
  try {
    fs.writeFileSync(SENSOR_CACHE_FILE, JSON.stringify(sensorCache, null, 2));
  } catch (err) {
    console.error('[CACHE] Error al escribir sensorCache.json:', err);
  }
}

// Guardar todos los datos de sensores en el archivo del día correspondiente
function guardarSensorHistorico(nuevoDato) {
  const today = getTodayDateString();
  if (today !== currentSensorsDate) {
    saveSensorsJsonForToday();
    loadSensorsJsonForToday();
  }
  sensorsJson.push(nuevoDato);
  saveSensorsJsonForToday();
}

function saveSensorsJsonForToday() {
  try {
    fs.writeFileSync(currentSensorsFile, JSON.stringify(sensorsJson, null, 2));
  } catch (err) {
    console.error('[SENSORS] Error al escribir', currentSensorsFile, err);
  }
}



// --- AUTENTIFICACION ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

// Registro de usuario
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (
    !username ||
    !password ||
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username) ||
    password.length < 6
  ) {
    return res.status(400).json({ error: 'Password must be at least 6 characters'});
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ message: 'User successfully created' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating user', details: err });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (
    !username ||
    !password ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({ error: 'Invalid username or password.' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Incorrect username or password' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect username or password' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    currentUserEmail = user.username;
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login error', details: err });
  }
});


// --- DATOS IMAGENES ---

// --- FUNCIÓN PARA INICIALIZAR IMAGESCACHE ---
function initializeImagesCache() {
  if (fs.existsSync(imageCacheDir)) {
    try {
      let filesInCacheDir = fs.readdirSync(imageCacheDir)
        .filter(file => /\.(jpe?g|png|gif)$/i.test(file)) // Filtrar solo imágenes
        .map(file => ({
          name: file,
          path: path.join(imageCacheDir, file), // Guardar la ruta completa para borrar y para el cache
          time: fs.statSync(path.join(imageCacheDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Ordenar por fecha de modificación, más reciente primero

      // Si hay más imágenes en el directorio que el tamaño de la caché, borrar las más antiguas
      if (filesInCacheDir.length > IMAGES_CACHE_SIZE) {
        const filesToDelete = filesInCacheDir.slice(IMAGES_CACHE_SIZE); // Todas excepto las IMAGES_CACHE_SIZE más recientes
        filesToDelete.forEach(fileObj => {
          try {
            fs.unlinkSync(fileObj.path);
            console.log(`[CACHE] Imagen antigua borrada de imageCacheDir: ${fileObj.name}`);
          } catch (err) {
            console.error(`[CACHE] Error al borrar imagen antigua ${fileObj.name} de imageCacheDir:`, err);
          }
        });
        // Actualizar la lista de archivos después de borrar
        filesInCacheDir = filesInCacheDir.slice(0, IMAGES_CACHE_SIZE);
      }

      // Poblar el array imagesCache en memoria con las imágenes restantes (las más recientes)
      imagesCache = filesInCacheDir.map(fileObj => ({
        filename: fileObj.name,
        path: fileObj.path,
        uploadDate: new Date(fileObj.time)
      }));

      if (imagesCache.length > 0) {
        console.log(`[CACHE] imagesCache inicializado con ${imagesCache.length} imagen(es) de imageCacheDir.`);
      } else {
        console.log('[CACHE] No hay imágenes en imageCacheDir para inicializar imagesCache.');
      }

    } catch (err) {
      console.error('[CACHE] Error al inicializar imagesCache desde el directorio:', err);
      imagesCache = []; // Asegurar que la caché esté vacía en caso de error
    }
  } else {
    console.log('[CACHE] El directorio imageCacheDir no existe. No se puede inicializar imagesCache.');
    imagesCache = [];
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid' }).replace(/[\s:]/g, '-').replace(',', '');
    const ext = path.extname(file.originalname);
    cb(null, `${now}${ext}`);
  }
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG'));
    }
  }
});

const cacheStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageCacheDir);
  },
  filename: function (req, file, cb) {
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid' }).replace(/[\s:]/g, '-').replace(',', '');
    const ext = path.extname(file.originalname);
    cb(null, `${now}${ext}`);
  }
});
const cacheUpload = multer({
  storage: cacheStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG'));
    }
  }
});



// Ruta para recibir imágenes JPG
app.post('/api/images', cacheUpload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen JPG' });
  }
  // El objeto que se pushea a imagesCache debe tener 'filename' y 'path'
  // 'path' debe ser la ruta donde multer guarda el archivo temporalmente (en imageCacheDir)
  imagesCache.push({
    filename: req.file.filename, // El nombre que le da multer (timestamp)
    path: req.file.path,         // La ruta completa donde multer guardó el archivo en imageCacheDir
    uploadDate: new Date()
  });

  // Copiar la imagen a imagesDir (todas las imágenes recibidas)
  const outgoingPath = path.join(imagesDir, req.file.filename);
  fs.copyFile(req.file.path, outgoingPath, (err) => { // req.file.path es la fuente correcta
    if (err) {
      console.error('Error al copiar imagen a images:', err);
    }
  });

  // Limitar tamaño de la caché y borrar archivos antiguos de imageCacheDir
  while (imagesCache.length > IMAGES_CACHE_SIZE) {
    const removed = imagesCache.shift();
    // removed.path es la ruta del archivo que se debe borrar de imageCacheDir
    if (removed && removed.path && fs.existsSync(removed.path)) {
      fs.unlink(removed.path, err => {
        if (err) console.error(`[CACHE] Error al borrar imagen ${removed.filename} de imageCacheDir:`, err);
      });
    }
  }

  // CLOUDINARY UPLOAD
if (USE_CLOUDINARY) {
  const now = Date.now();
  if (now - lastCloudinaryUpload >= CLOUDINARY_COOLDOWN_SECONDS * 1000) {
    try {
      const publicId = req.file.filename.replace(/\.[^/.]+$/, ""); // quita extensión
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "IoTHarvestImages",
        public_id: publicId, // <-- nombre igual que en local
        overwrite: true
      });
      lastCloudinaryUpload = now;
      console.log(`[CLOUDINARY] Imagen subida: ${result.secure_url}`);
      return res.json({ 
        message: 'Imagen recibida, guardada, cacheada y subida a Cloudinary', 
        filename: req.file.filename, 
        cloudinaryUrl: result.secure_url 
      });
    } catch (err) {
      console.error('[CLOUDINARY] Error al subir imagen:', err);
    }
  } else {
    console.log('[CLOUDINARY] Cooldown activo, imagen solo guardada localmente.');
  }
}
  res.json({ message: 'Imagen recibida, guardada y cacheada', filename: req.file.filename });
});


// --- DATOS SENSORES ---

// Ruta para recibir datos (POST)
app.post('/api/sensores', async (req, res) => {
  const { temperatura, humedad_aire, humedad_suelo, bateria, status } = req.body;

  // Por defecto es false, solo será true si el header está presente y es 'true'
  const isTestData = req.headers['x-test-data'] === 'true';

  try {
    const datos = { 
      temperatura, 
      humedad_aire, 
      humedad_suelo, 
      bateria, 
      status, 
      timeServer: new Date(),
      isTestData // este campo indica si es test o no
    };

    actualizarSensorCacheRam(datos);
    actualizarSensorCache(datos);
    guardarSensorHistorico(datos);

    const sensor = new Sensor(datos);
    await sensor.save();

    if (status !== 0) {
      console.log(`[MAIL] Intentando enviar mail para status ${status} a ${currentUserEmail}...`);
      await enviarMail(currentUserEmail, status);
    }

    res.json({ message: 'Datos recibidos y guardados', datos });
  } catch (error) {
    console.error('[ERROR] Error en /api/sensores:', error);
    res.status(500).json({ error: 'Error al guardar datos', detalles: error });
  }
});


// --- GESTIÓN DE MAILS ---

async function enviarMail(destinatario, status) {
  const mailPath = path.join(mailDir, `${status}.txt`);
  const footerImagePath = path.join(mailDir, 'pie_correo.png');
  let cuerpoTexto;

  try {
    cuerpoTexto = fs.readFileSync(mailPath, 'utf8');
  } catch (err) {
    console.error(`[MAIL] No se pudo leer el mensaje para status ${status}:`, err);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_FROM,
      pass: process.env.MAIL_PASS
    }
  });

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; font-size: 14px;">
      <p>${cuerpoTexto.replace(/\n/g, '<br>')}</p>
      <br>
      <img src="cid:piecorreo" style="max-width: 100%; height: auto;" alt="pie_correo">
    </div>
  `;

  try {
    let info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: destinatario,
      subject: MAIL_SUBJECT,
      text: cuerpoTexto,
      html: htmlBody,
      attachments: [{
        filename: 'pie_correo.png',
        path: footerImagePath,
        cid: 'piecorreo'
      }]
    });

    console.log(`[MAIL] Correo enviado correctamente a ${destinatario}. MessageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[MAIL] Error al enviar correo a ${destinatario}:`, err);
  }
}

// Conversión de fecha a hora local de España (Europe/Madrid)
function toHoraEspañola(date) {
  return new Date(date).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
}
// Función para obtener la fecha de hoy en formato YYYY-MM-DD
function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}
// Función para cargar el archivo JSON de sensores del día actual
function loadSensorsJsonForToday() {
  currentSensorsDate = getTodayDateString();
  currentSensorsFile = path.join(sensorsDir, `${currentSensorsDate}.json`);
  if (fs.existsSync(currentSensorsFile)) {
    try {
      sensorsJson = JSON.parse(fs.readFileSync(currentSensorsFile, 'utf8'));
    } catch (err) {
      console.error('[SENSORS] Error al leer', currentSensorsFile, err);
      sensorsJson = [];
    }
  } else {
    sensorsJson = [];
  }
}

// --- ENDPOINTS ---

// Último dato en caché
app.get('/api/sensores/ultimo', (req, res) => {
  if (cacheUltimosDatos) {
    const datosConvertidos = {
      ...cacheUltimosDatos,
      timeServer: toHoraEspañola(cacheUltimosDatos.timeServer)
    };
    return res.json(datosConvertidos);
  }
  if (fs.existsSync(SENSOR_CACHE_FILE)) {
    try {
      const cacheArchivo = JSON.parse(fs.readFileSync(SENSOR_CACHE_FILE, 'utf8'));
      if (Array.isArray(cacheArchivo) && cacheArchivo.length > 0) {
        const ultimo = cacheArchivo[cacheArchivo.length - 1];
        const datosConvertidos = {
          ...ultimo,
          timeServer: toHoraEspañola(ultimo.timeServer)
        };
        return res.json(datosConvertidos);
      }
    } catch (err) {
      console.error('[CACHE] Error al leer sensorCache.json:', err);
    }
  }
  res.status(404).json({ error: 'No hay datos en caché' });
});

// Últimos X datos (MongoDB)
app.get('/api/sensores/ultimos/:cantidad', async (req, res) => {
  const cantidad = parseInt(req.params.cantidad, 10);
  if (isNaN(cantidad) || cantidad <= 0) {
    return res.status(400).json({ error: 'La cantidad debe ser un número positivo válido.' });
  }
  try {
    const datos = await Sensor.find().sort({ timeServer: -1 }).limit(cantidad);
    const datosConvertidos = datos.map(d => ({
      ...d.toObject(),
      timeServer: toHoraEspañola(d.timeServer)
    }));
    res.json(datosConvertidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos', detalles: error });
  }
});

// Todos los datos (MongoDB)
app.get('/api/sensores', async (req, res) => {
  try {
    const datos = await Sensor.find();
    const datosConvertidos = datos.map(d => ({
      ...d.toObject(),
      timeServer: toHoraEspañola(d.timeServer)
    }));
    res.json(datosConvertidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos', detalles: error });
  }
});

// Todos los datos del día actual (JSON redundante)
app.get('/api/sensors/json', (req, res) => {
  res.json(sensorsJson);
});

// Todos los datos de un día concreto (JSON redundante)
app.get('/api/sensors/json/:date', (req, res) => {
  const date = req.params.date; // formato YYYY-MM-DD
  const file = path.join(sensorsDir, `${date}.json`);
  if (fs.existsSync(file)) {
    try {
      const datos = JSON.parse(fs.readFileSync(file, 'utf8'));
      res.json(datos);
    } catch (err) {
      res.status(500).json({ error: 'Error al leer archivo', details: err });
    }
  } else {
    res.status(404).json({ error: 'No data file for this date' });
  }
});


// Endpoint para servir el contenido de prediction.txt
app.get('/api/prediction', (req, res) => {
  const predictionPath = path.join(__dirname, '../frontend/prediction.txt');
  fs.readFile(predictionPath, 'utf8', (err, data) => {
    if (err) {
      console.error('[PREDICTION] Error al leer prediction.txt:', err);
      return res.status(500).json({ error: 'No se pudo leer prediction.txt' });
    }
    res.type('text/plain').send(data);
  });
});

// Cache de imágenes (solo metadatos)
app.get('/api/images/cache', (req, res) => {
  res.json(imagesCache);
});

// Descargar N imágenes de Cloudinary
const testDownloadDir = path.join(__dirname, 'data/test/downloadImages');

// Función para descargar una imagen desde una URL
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    mod.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Descargar N imágenes de Cloudinary 
app.post('/api/images/download-cloudinary', async (req, res) => {
  const { password, n } = req.body;
  const adminPass = process.env.ADMIN_SCRIPT_PASS;
  let cantidad = parseInt(n, 10);
  if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
  if (cantidad > 10) cantidad = 10;

  if (!password || password !== adminPass) {
    return res.status(403).json({ error: 'Forbidden: Invalid password' });
  }

  // Crear carpeta si no existe
  if (!fs.existsSync(testDownloadDir)) {
    fs.mkdirSync(testDownloadDir, { recursive: true });
  }

  try {
    const result = await cloudinary.search
      .expression('folder:IoTHarvestImages')
      .sort_by('uploaded_at','desc')
      .max_results(cantidad)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      filename: path.basename(img.public_id) + '.' + img.format
    }));

    // Descargar imágenes usando solo módulos estándar
    let downloaded = [];
    for (const img of images) {
      const destPath = path.join(testDownloadDir, img.filename);
      // Asegura que la carpeta destino existe
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      await downloadImage(img.url, destPath);
      downloaded.push(img.filename);
    }

    res.json({ message: `Descargadas ${downloaded.length} imágenes`, files: downloaded });
  } catch (err) {
    console.error('[CLOUDINARY] Error al descargar imágenes:', err);
    res.status(500).json({ error: 'Error al descargar imágenes de Cloudinary' });
  }
});


const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));