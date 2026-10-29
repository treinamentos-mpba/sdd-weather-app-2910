import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
    adminArea: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 18.2,
    weatherCode: 1,
    observedAt: '2026-10-29T12:00',
    humidityPercent: 72,
    windSpeedKmh: 12.4,
    precipitationMm: 0,
    pressureHpa: 1013.2,
  },
  forecastDays: [
    {
      date: '2026-10-29',
      minimumC: 12.1,
      maximumC: 21.4,
      weatherCode: 1,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-30',
      minimumC: 13,
      maximumC: 22,
      weatherCode: 2,
      precipitationProbabilityPercent: 20,
    },
    {
      date: '2026-10-31',
      minimumC: 14.2,
      maximumC: 23.1,
      weatherCode: 3,
      precipitationProbabilityPercent: 35,
    },
    {
      date: '2026-11-01',
      minimumC: 15,
      maximumC: 24,
      weatherCode: 0,
      precipitationProbabilityPercent: 5,
    },
    {
      date: '2026-11-02',
      minimumC: 14.7,
      maximumC: 22.8,
      weatherCode: 61,
      precipitationProbabilityPercent: 80,
    },
  ],
};
