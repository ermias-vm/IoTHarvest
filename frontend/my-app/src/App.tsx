import React from 'react';
import mockData from './mockData';
import './App.css';

function App() {
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
        </div>
      </div>
      <div className="photo-container">
      </div>
    </div>
  );
}

export default App;
