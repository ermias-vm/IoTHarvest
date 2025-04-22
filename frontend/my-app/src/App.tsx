import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    batery: 0,
    timestamp: ''
  });

  // Función para obtener datos del backend
  const fetchSensorData = () => {
    fetch('http://localhost:1500/api/sensores/ultimo')
      .then((res) => res.json())
      .then((data) => setSensorData(data))
      .catch((err) => console.error('Error al obtener datos:', err));
  };

  useEffect(() => {
    fetchSensorData();

    const interval = setInterval(() => {
      fetchSensorData(); // Cada 10 minutos
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background-container">
      <div className="title">
        <h1>IoT Harvest</h1>
      </div>

      <div className="graphs-container">
        <div className="air-humidity-container">
          <div className="air-humidity-title">
            <h1>Air Humidity</h1>
          </div>
        </div>

        <div className="ground-humidity-container">
          <div className="ground-humidity-title">
            <h1>Ground Humidity</h1>
          </div>
        </div>

        <div className="temperature-container">
          <div className="temperature-title">
            <h1>Temperature</h1>
          </div>
        </div>

        <div className="real-time-container">
          <div className="real-time-title">
            <h1>Real Time</h1>
          </div>
          <div className="real-time-content">
            <div className="real-time-data">
              <p><strong>Temperature:</strong> {sensorData.temperature}°C</p>
              <p><strong>Humidity:</strong> {sensorData.humidity}%</p>
              <p><strong>Batery:</strong> {sensorData.batery}%</p>
            </div>
            <div className="time-display">
              {new Date(sensorData.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="photo-container"></div>
    </div>
  );
}

export default App;
