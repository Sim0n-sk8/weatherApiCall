'use client';

import React, { useEffect, useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

interface CurrentWeather {
  temperature: number;
  precipitation: number;
  cloudCover: number;
  humidity: number;
  windSpeed: number;
  time: Date;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [hourlyTemps, setHourlyTemps] = useState<{ time: string; temp: number }[]>([]);

  useEffect(() => {
    const getWeather = async () => {
      const params = {
        latitude: -33.9611,
        longitude: 25.6149,
        hourly: 'temperature_2m',
        current: [
          'precipitation',
          'temperature_2m',
          'rain',
          'cloud_cover',
          'relative_humidity_2m',
          'is_day',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m',
          'showers'
        ],
        timezone: 'Africa/Johannesburg',
        past_days: 1,
      };

      const url = 'https://api.open-meteo.com/v1/forecast';
      const responses = await fetchWeatherApi(url, params);
      const response = responses[0];

      const current = response.current();
      const hourly = response.hourly();
      if (!current || !hourly) return;

      const utcOffsetSeconds = response.utcOffsetSeconds();

      const data: CurrentWeather = {
        temperature: current.variables(1)?.value() ?? 0,
        precipitation: current.variables(0)?.value() ?? 0,
        cloudCover: current.variables(3)?.value() ?? 0,
        humidity: current.variables(4)?.value() ?? 0,
        windSpeed: current.variables(6)?.value() ?? 0,
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      };

      // Map hourly temperatures for chart
      const hourlyData = hourly.variables(0)?.valuesArray().map((t, i) => ({
        temp: t,
        time: new Date(Number(hourly.time()) + i * hourly.interval() * 1000 + utcOffsetSeconds * 1000).getHours() + ':00'
      })) ?? [];

      setWeather(data);
      setHourlyTemps(hourlyData);
    };

    getWeather();
  }, []);

  if (!weather) return <p className="text-center mt-10 text-xl animate-pulse">Loading weather...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-3xl p-8 shadow-2xl mt-10 text-white"
    >
      <h1 className="text-4xl font-bold mb-4">🌤 Current Weather</h1>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white/20 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
          <p className="text-sm uppercase">Temperature</p>
          <p className="text-2xl font-semibold">{weather.temperature.toFixed(1)}°C</p>
        </div>
        <div className="bg-white/20 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
          <p className="text-sm uppercase">Humidity</p>
          <p className="text-2xl font-semibold">{weather.humidity}%</p>
        </div>
        <div className="bg-white/20 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
          <p className="text-sm uppercase">Wind Speed</p>
          <p className="text-2xl font-semibold">{weather.windSpeed} m/s</p>
        </div>
        <div className="bg-white/20 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform">
          <p className="text-sm uppercase">Precipitation</p>
          <p className="text-2xl font-semibold">{weather.precipitation} mm</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Hourly Temperature 🌡</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={hourlyTemps}>
          <CartesianGrid strokeDasharray="3 3" stroke="white" opacity={0.3} />
          <XAxis dataKey="time" stroke="white" />
          <YAxis stroke="white" />
          <Tooltip contentStyle={{ backgroundColor: '#333', borderRadius: '8px', color: '#fff' }} />
          <Line type="monotone" dataKey="temp" stroke="#fff" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default Weather;
