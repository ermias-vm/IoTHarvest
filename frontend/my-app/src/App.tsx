// src/App.js
import React from 'react';
import mockData from './mockData';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Datos de Sensores</h1>
      <table border={1} style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Temperatura (°C)</th>
            <th>Humedad (%)</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((data) => (
            <tr key={data.id}>
              <td>{data.id}</td>
              <td>{data.temperatura}</td>
              <td>{data.humedad}</td>
              <td>{data.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
