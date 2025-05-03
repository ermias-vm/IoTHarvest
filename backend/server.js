const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware para recibir datos en formato JSON
app.use(express.json());

// Colores ANSI
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m"; 

require('dotenv').config();
const LOCAL= 'mongodb://localhost/iotharvest';
const CLUSTER = process.env.MONGODB_URL;

const USED_DB = CLUSTER;  // Usar LOCAL o CLUSTER

mongoose.connect(USED_DB, {
  dbName: 'iotharvest' // Nombre de la base de datos
})
  .then(() => {
    const dbType = USED_DB.includes('localhost') ? `${GREEN}Local${RESET}` : `${CYAN}Cluster${RESET}`;
    console.log(`Conectado a MongoDB [${dbType}]`);
  })
  .catch(err => console.error('Error al conectar:', err));

//MULTER para imágenes
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Crear carpeta si no existe
const imagesDir = path.join(__dirname, '../tests/outgoingImages');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

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

// Ruta para recibir imágenes JPG
app.post('/api/upload-image', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen JPG' });
  }
  res.json({ message: 'Imagen recibida y guardada', filename: req.file.filename });
});



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

// Iniciar el servidor
const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
