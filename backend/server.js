const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware para recibir datos en formato JSON
app.use(express.json());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost/iotharvest', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar:', err));

// Esquema para los datos de sensores
const sensorSchema = new mongoose.Schema({
  temperatura: Number,
  humedad: Number,
  fecha: { type: String, default: () => new Date().toISOString() }, // Fecha actual exacta
  timestamp: { type: Date, default: Date.now } // Timestamp automático
});
const Sensor = mongoose.model('Sensor', sensorSchema);

// Ruta para recibir datos (POST)
app.post('/api/sensores', async (req, res) => {
  const { temperatura, humedad } = req.body;
  try {
    const datos = new Sensor({ temperatura, humedad });
    await datos.save(); // Guardar en MongoDB
    res.json({ message: 'Datos recibidos y guardados', datos });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar datos', detalles: error });
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
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));