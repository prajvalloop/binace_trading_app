import { useState, useEffect } from 'react';
import axios from 'axios';

 
function Weather() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const fetchWeatherData = async () => {
    try {
      const response = await axios.get('https://api.data.gov.sg/v1/environment/air-temperature');
      const { stations } = response.data.metadata;
      const readings = response.data.items[0].readings;
     
      const combinedData = readings.map(reading => {
        const stationInfo = stations.find(station => station.id === reading.station_id);
        return {
          ...reading,
          name: stationInfo.name,
          location: stationInfo.location
        };
      });
     
      setWeatherData(combinedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };
 
  const formatTime = () => {
    return new Date().toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };
 
  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 60000);
    return () => clearInterval(interval);
  }, []);
 
 
  if (loading) {
    return <div className="loading">Loading weather data...</div>;
  }
 
  return (
    <div className="weather-page">
      <div className="weather-container">
        <h1>Singapore Weather Stations</h1>
        <div className="weather-grid">
          {weatherData.map((station) => (
            <div key={station.station_id} className="weather-card">
              <div className="card-content">
                <h3>{station.name}</h3>
                <div className="location-info">
                  <p className="coordinates">
                    {station.location.latitude.toFixed(4)}°N, {station.location.longitude.toFixed(4)}°E
                  </p>
                </div>
                <div className="temperature">
                  <span className="temp-value">{station.value}°C</span>
                  <p className="station-id">Station ID: {station.station_id}</p>
                  <p className="timestamp">Last updated: {formatTime()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
 
export default Weather;
 