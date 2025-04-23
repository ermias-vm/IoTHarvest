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
  dbName: 'iotharvest' // Especificar base de datos aquí
})
  .then(() => {
    const dbType = USED_DB.includes('localhost') ? `${GREEN}Local${RESET}` : `${CYAN}Cluster${RESET}`;
    console.log(`Conectado a MongoDB [${dbType}]`);
  })
  .catch(err => console.error('Error al conectar:', err));

// Esquema para los datos de sensores
const sensorSchema = new mongoose.Schema({
  temperatura: { type: Number, required: true },
  humedad_aire: { type: Number, required: true },
  humedad_suelo: { type: Number, required: true },
  bateria: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
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
    const datos = { temperatura, humedad_aire, humedad_suelo, bateria, timestamp: new Date() };

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

// Ruta para ver los ultimos datos
app.get('/api/sensores/ultimo', (req, res) => {
  if (cacheUltimosDatos) {
    res.json(cacheUltimosDatos);
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
    // Obtener los últimos X datos desde la base de datos
    const datos = await Sensor.find().sort({ timestamp: -1 }).limit(cantidad); // Últimos X registros

    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos', detalles: error });
  }
});

// Ruta para ver todos los datos (GET)
app.get('/api/sensores', async (req, res) => {
  try {
    const datos = await Sensor.find(); // Obtener todos los datos de MongoDB
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos', detalles: error });
  }
});

// Iniciar el servidor
const PORT = 1500;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));