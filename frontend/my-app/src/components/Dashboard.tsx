const SENSOR_FETCH_INTERVAL = 10000;
import { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

interface WeatherData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

const weatherIcons: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  61: "🌧️",
  71: "❄️",
  80: "🌦️",
  95: "⛈️",
};

const Dashboard = () => {
  const [sensorData, setSensorData] = useState<{
    temperatura: number;
    humedad_aire: number;
    humedad_suelo: number;
    timeServer: string;
  } | null>(null);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [latestImageUrl, setLatestImageUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState('');

  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/sensores/ultimo');
        const data = await res.json();
  
        if (data.temperatura !== undefined) {
          setSensorData({
            temperatura: data.temperatura,
            humedad_aire: data.humedad_aire,
            humedad_suelo: data.humedad_suelo,
            timeServer: data.timeServer
          });
        } else {
          console.warn("Datos de sensor incompletos:", data);
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };
  
    fetchSensorData();
    const interval = setInterval(fetchSensorData, SENSOR_FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=41.3874&longitude=2.1686&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe%2FMadrid"
        );
        const data = await res.json();
        setWeather(data.daily);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
  
    fetchWeather();
  }, []);

  useEffect(() => {
    const fetchLatestImage = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/images/cache');
        const images = await res.json();
        if (Array.isArray(images) && images.length > 0) {
          const lastImage = images[images.length - 1]; // Última imagen agregada
          setLatestImageUrl(`http://localhost:8080/imageCache/${lastImage.filename}`);
        }
      } catch (error) {
        console.error("Error fetching latest image:", error);
      }
    };

    fetchLatestImage();
  }, []);

  useEffect(() => {
    // Fetch IA prediction
    fetch('http://localhost:8080/api/prediction')
      .then(res => res.text())
      .then(text => setPrediction(text.trim()))
      .catch(() => setPrediction('Error'));
  }, []);

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
        {userEmail || 'User'}
      </div>
      <button
        onClick={() => navigate('/login')}
        style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem 1rem', background: '#b81414', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >Log Out</button>

      <div className="top-panels">
        <div className="graphs-container">
          <div className="sensors-grid">
            <iframe
              style={{ width: '90%', height: '47%', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(70, 76, 79, 0.2)', marginTop: '0.5rem', background: 'transparent' }}
              src="https://charts.mongodb.com/charts-project-0-qzasans/embed/charts?id=847cde5d-d152-45d1-9e85-2312054e05d8&maxDataAge=3600&theme=light&autoRefresh=true"
            />
            <iframe
              style={{ width: '90%', height: '47%', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(70, 76, 79, 0.2)', marginTop: '0.5rem', background: 'transparent' }}
              src="https://charts.mongodb.com/charts-project-0-qzasans/embed/charts?id=8aff4f45-6bd9-4eaa-b77c-6150ba205924&maxDataAge=3600&theme=light&autoRefresh=true"
            />
            <iframe
              style={{ width: '90%', height: '47%', border: 'none', borderRadius: '8px', boxShadow: '0 2px 10px rgba(70, 76, 79, 0.2)', marginTop: '0.5rem', background: 'transparent' }}
              src="https://charts.mongodb.com/charts-project-0-qzasans/embed/charts?id=f4a60464-3d7b-4880-a5ea-bea40bb6ce66&maxDataAge=3600&theme=light&autoRefresh=true"
            />
            <div className="sensor-container">
              <div className="sensor-title">Real time data</div>
              <div className="sensor-data-wrapper">
                <div className="sensor-data">
                  {sensorData ? (
                    <>
                      <p>Temperature: {sensorData.temperatura}°C</p>
                      <p>Air Humidity: {sensorData.humedad_aire}%</p>
                      <p>Ground Humidity: {sensorData.humedad_suelo}%</p>
                      <p>Last Update: {sensorData.timeServer || 'N/A'}</p>
                    </>
                  ) : (
                    <p>Loading sensor data...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="photo-container">
          <div className="photo-inner-container">
            <div className="photo-box-top">
              {latestImageUrl ? (
                <>
                  <img src={latestImageUrl} alt="Latest Capture" style={{ width: '67%', height: '70%', objectFit: 'cover'}} />
                  {/* Mostrar timestamp debajo de la foto */}
                  {(() => {
                    const filename = latestImageUrl.split('/').pop() || '';
                    const parts = filename.replace('.jpg', '').split('-');
                    let formatted = '';
                    if (parts.length === 6) {
                      const [year, month, day, hour, min] = parts;
                      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                      const monthName = months[parseInt(month, 10) - 1] || '';
                      formatted = `${day} of ${monthName} ${year}, ${hour}:${min} h`;
                    }
                    return (
                      <>
                        <div style={{
                          marginTop: 'var(--photo-timestamp-margin, 3vh)',
                          color: '#333',
                          fontSize: '1rem',
                          textAlign: 'center',
                          wordBreak: 'break-all'
                        }}>
                          {formatted}
                        </div>
                        <div style={{
                          marginTop: '1vh',
                          color: '#666',
                          fontSize: '1rem',
                          textAlign: 'center'
                        }}>
                          IA prediction: {prediction}
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : (
                <p style={{ textAlign: 'center' }}>Loading image...</p>
              )}
            </div>
            <div className="photo-box-bottom">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '0.2rem', color: '#000' }}>
                {weather && (
                  <div style={{
                    background: 'transparent',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    width: '100%',
                    color: '#000'
                  }}>
                    {weather.time.map((date, index) => {
                      const d = new Date(date);
                      const day = d.getDate().toString().padStart(2, '0');
                      const month = (d.getMonth() + 1).toString().padStart(2, '0');
                      return (
                        <div key={date} style={{ textAlign: 'center', fontSize: '0.8rem', minWidth: '60px', flex: '1 1 60px', maxWidth: '80px', color: '#000' }}>
                          <div>{`${day}/${month}`}</div>
                          <div style={{ fontSize: '2.5rem' }}>
                            {weatherIcons[weather.weathercode[index]] || "❓"}
                          </div>
                          <div>
                            {Math.round(weather.temperature_2m_max[index])}º - {Math.round(weather.temperature_2m_min[index])}º
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;