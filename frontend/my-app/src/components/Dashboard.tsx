import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    batery: 0,
    timestamp: ''
  });

  const navigate = useNavigate();

  return (
    <div className="background-container">
      <h1 className="title">IoT Harvest</h1>
      <div 
        style={{ 
          position: 'absolute', 
          top: 'var(--logout-button-top, 1rem)', 
          left: 'var(--logout-button-left, 1rem)', 
          padding: '0.5rem 1rem', 
          background: '#7ca982', 
          color: 'white', 
          borderRadius: '5px' 
        }}
      >
        User {/* // Aquí se mostraría el nombre del usuario obtenido del backend */}
      </div>
      <button 
        onClick={() => navigate('/login')} 
        style={{ 
          position: 'absolute', 
          top: 'var(--logout-button-top, 1rem)', 
          right: 'var(--logout-button-right, 1rem)', 
          padding: '0.5rem 1rem', 
          background: '#b81414', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer' 
        }}
      >Log Out</button>

      <div className="top-panels">
        <div className="graphs-container">

          <div className="sensors-grid">
            <div className="sensor-container">
              <div className="sensor-title">Air humidity</div>
            </div>
            <div className="sensor-container">
              <div className="sensor-title">Ground humidity</div>
            </div>
            <div className="sensor-container">
              <div className="sensor-title">Temperature</div>
            </div>
            <div className="sensor-container">
              <div className="sensor-title">Real time data</div>
              <div className="sensor-data">
                <p>Temperature: {sensorData.temperature}°C</p>
                <p>Humidity: {sensorData.humidity}%</p>
                <p>Batery: {sensorData.batery}%</p>
                <p>Last upgrade: {sensorData.timestamp || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="photo-container">
          <div className="photo-inner-container">
            <div className="photo-box-top">
            </div>
            <div className="photo-box-bottom">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;