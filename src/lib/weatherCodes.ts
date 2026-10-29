interface WeatherCodeInfo {
  description: string;
  icon: string;
}

const weatherCodes: Record<number, WeatherCodeInfo> = {
  0: { description: 'Céu limpo', icon: '☀️' },
  1: { description: 'Predominantemente limpo', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Nevoeiro', icon: '🌫️' },
  48: { description: 'Nevoeiro com geada', icon: '🌫️' },
  51: { description: 'Chuvisco leve', icon: '🌦️' },
  53: { description: 'Chuvisco moderado', icon: '🌦️' },
  55: { description: 'Chuvisco intenso', icon: '🌧️' },
  56: { description: 'Chuvisco congelante leve', icon: '🌧️' },
  57: { description: 'Chuvisco congelante intenso', icon: '🌧️' },
  61: { description: 'Chuva leve', icon: '🌧️' },
  63: { description: 'Chuva moderada', icon: '🌧️' },
  65: { description: 'Chuva intensa', icon: '🌧️' },
  66: { description: 'Chuva congelante leve', icon: '🌧️' },
  67: { description: 'Chuva congelante intensa', icon: '🌧️' },
  71: { description: 'Neve leve', icon: '🌨️' },
  73: { description: 'Neve moderada', icon: '🌨️' },
  75: { description: 'Neve intensa', icon: '❄️' },
  77: { description: 'Grãos de neve', icon: '🌨️' },
  80: { description: 'Pancadas de chuva leves', icon: '🌦️' },
  81: { description: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { description: 'Pancadas de chuva intensas', icon: '🌧️' },
  85: { description: 'Pancadas de neve leves', icon: '🌨️' },
  86: { description: 'Pancadas de neve intensas', icon: '❄️' },
  95: { description: 'Trovoada', icon: '⛈️' },
  96: { description: 'Trovoada com granizo leve', icon: '⛈️' },
  99: { description: 'Trovoada com granizo intenso', icon: '⛈️' },
};

const unknownWeatherCode: WeatherCodeInfo = {
  description: 'Condição indisponível',
  icon: '？',
};

export function getWeatherCodeInfo(weatherCode?: number): WeatherCodeInfo {
  if (weatherCode === undefined) {
    return unknownWeatherCode;
  }

  return weatherCodes[weatherCode] ?? unknownWeatherCode;
}
