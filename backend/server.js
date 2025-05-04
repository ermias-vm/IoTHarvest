const express = require('express');
const mongoose = require('mongoose');
const app = express();

//MULTER para imágenes
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Middleware para recibir datos en formato JSON
app.use(express.json());

// Colores ANSI
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m"; 

require('dotenv').config();
const LOCAL= 'mongodb://localhost/iotharvest';
const CLUSTER = process.env.MONGODB_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const USED_DB = CLUSTER;  // Usar LOCAL o CLUSTER

// Conexión a MongoDB
mongoose.connect(USED_DB, {
  dbName: 'iotharvest' // Nombre de la base de datos
})
  .then(() => {
    const dbType = USED_DB.includes('localhost') ? `${GREEN}Local${RESET}` : `${CYAN}Cluster${RESET}`;
    console.log(`Conectado a MongoDB [${dbType}]`);
  })
  .catch(err => console.error('Error al conectar:', err));


                            ////  AUTENTIFICACION /////

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);


// Registro de usuario
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(400).json({ error: 'Error al crear usuario', detalles: err });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error en login', detalles: err });
  }
});


                            ////  DATOS IMAGENES /////

// Crear carpeta test imagenes si no existe
const imagesDir = path.join(__dirname, '../tests/outgoingImages');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Crear carpeta de caché si no existe
const imageCacheDir = path.join(__dirname, 'imageCache');
if (!fs.existsSync(imageCacheDir)) {
  fs.mkdirSync(imageCacheDir, { recursive: true });
}

// Parámetros de la caché
const IMAGES_CACHE_SIZE = 14; // 2 semanas (1 imagen diaria)
let imagesCache = [];

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesDir);
  },
  filename: function (req, file, cb) {
    // Obtener la fecha en hora española y formatearla para el nombre de archivo
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

// Configuración de multer para guardar en la caché
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
app.post('/api/images', cacheUpload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen JPG' });
  }
  // Añadir a la caché en memoria
  imagesCache.push({
    filename: req.file.filename,
    path: req.file.path,
    uploadDate: new Date()
  });

  // Copiar la imagen a outgoingImages (simula subida a S3 AWS)
  const outgoingPath = path.join(imagesDir, req.file.filename);
  fs.copyFile(req.file.path, outgoingPath, (err) => {
    if (err) {
      console.error('Error al copiar imagen a outgoingImages:', err);
    }
  });

  // Limitar tamaño de la caché y borrar archivos antiguos
  while (imagesCache.length > IMAGES_CACHE_SIZE) {
    const removed = imagesCache.shift();
    // Eliminar archivo antiguo del disco
    fs.unlink(removed.path, err => {
      if (err) console.error('Error al borrar imagen de la caché:', err);
    });
  }
  res.json({ message: 'Imagen recibida, guardada y cacheada', filename: req.file.filename });
});



                            ////  DATOS SENSORES /////

// Esquema para los datos de sensores
const sensorSchema = new mongoose.Schema({
  temperatura: { type: Number, required: true },
  humedad_aire: { type: Number, required: true },
  humedad_suelo: { type: Number, required: true },
  bateria: { type: Number, required: true },
  timeServer: { type: Date, default: Date.now }
}, { collection: 'sensorsData' });

const Sensor = mongoose.model('Sensor', sensorSchema);
let cacheUltimosDatos = null;

function actualizarCache(datos) {
  cacheUltimosDatos = datos;
}

// Ruta para recibir datos (POST)
app.post('/api/sensores', async (req, res) => {
  const { temperatura, humedad_aire, humedad_suelo, bateria } = req.body;
  try {
    const datos = { temperatura, humedad_aire, humedad_suelo, bateria, timeServer: new Date() };

    // Actualizar la caché antes de guardar en la base de datos
    actualizarCache(datos);

    // Guardar en MongoDB
    const sensor = new Sensor(datos);
    await sensor.save();

    res.json({ message: 'Datos recibidos y guardados', datos });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar datos', detalles: error });
  }
});

// Conversión de fecha a hora local de España (Europe/Madrid)
function toHoraEspañola(date) {
  return new Date(date).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
}




                            ////  ENDPOINTS  /////

// Ruta para ver los ultimos datos
app.get('/api/sensores/ultimo', (req, res) => {
  if (cacheUltimosDatos) {
    const datosConvertidos = {
      ...cacheUltimosDatos,
      timeServer: toHoraEspañola(cacheUltimosDatos.timeServer)
    };
    res.json(datosConvertidos);
  } else {
    res.status(404).json({ error: 'No hay datos en caché' });
  }
});

// Ruta para obtener los últimos X datos
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

// Ruta para ver todos los datos (GET)
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

// Endpoint consultar la cache de imágenes (solo metadatos) 
app.get('/api/images/cache', (req, res) => {
  res.json(imagesCache);
});


// Iniciar el servidor
const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
