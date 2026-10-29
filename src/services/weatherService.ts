import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
  WeatherServiceError,
} from '../types/weather';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toCity(value: unknown): City[] {
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude)
  ) {
    return [];
  }

  const city: City = {
    name: value.name,
    latitude: value.latitude,
    longitude: value.longitude,
  };

  if (typeof value.id === 'number' && Number.isFinite(value.id)) city.id = value.id;
  if (typeof value.admin1 === 'string') city.adminArea = value.admin1;
  if (typeof value.country === 'string') city.country = value.country;
  if (typeof value.country_code === 'string') city.countryCode = value.country_code;
  if (typeof value.timezone === 'string') city.timezone = value.timezone;

  return [city];
}

function createServiceError(
  kind: WeatherServiceError['kind'],
  status?: number,
  message?: string,
): WeatherServiceError {
  const error: WeatherServiceError = { kind };
  if (status !== undefined) error.status = status;
  if (message !== undefined) error.message = message;
  return error;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function numberAt(daily: Record<string, unknown>, key: string, index: number): number | undefined {
  const values = daily[key];
  return Array.isArray(values) ? finiteNumber(values[index]) : undefined;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (isRecord(error) && error.name === 'AbortError') {
      throw createServiceError('timeout', undefined, 'A requisição demorou demais.');
    }

    throw createServiceError('network', undefined, 'Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw createServiceError('http', response.status);
  }

  try {
    return await response.json();
  } catch {
    throw createServiceError('invalid-response');
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return [];
  }

  const url =
    'https://geocoding-api.open-meteo.com/v1/search' +
    `?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;

  const payload = await fetchJson(url);

  if (!isRecord(payload)) {
    throw createServiceError('invalid-response');
  }

  if (payload.results === undefined) {
    return [];
  }

  if (!Array.isArray(payload.results)) {
    throw createServiceError('invalid-response');
  }

  return payload.results.flatMap(toCity);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    daily: 'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: 'auto',
    forecast_days: '5',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const payload = await fetchJson(url);

  if (!isRecord(payload)) {
    throw createServiceError('invalid-response');
  }

  const currentPayload = payload.current;
  const dailyPayload = payload.daily;
  if (!isRecord(currentPayload) || !isRecord(dailyPayload)) {
    throw createServiceError('invalid-response');
  }

  const timezone = stringValue(payload.timezone);
  const dates = dailyPayload.time;
  if (
    !timezone ||
    !Array.isArray(dates) ||
    dates.length < 5 ||
    dates.slice(0, 5).some((date) => typeof date !== 'string')
  ) {
    throw createServiceError('invalid-response');
  }

  const current: CurrentWeather = {
    temperatureC: finiteNumber(currentPayload.temperature_2m),
    weatherCode: finiteNumber(currentPayload.weather_code),
    observedAt: stringValue(currentPayload.time),
    humidityPercent: finiteNumber(currentPayload.relative_humidity_2m),
    windSpeedKmh: finiteNumber(currentPayload.wind_speed_10m),
    precipitationMm:
      currentPayload.precipitation === null ? 0 : finiteNumber(currentPayload.precipitation),
    pressureHpa: finiteNumber(currentPayload.surface_pressure),
  };

  const forecastDays: ForecastDay[] = dates.slice(0, 5).map((date, index) => ({
    date: date as string,
    minimumC: numberAt(dailyPayload, 'temperature_2m_min', index),
    maximumC: numberAt(dailyPayload, 'temperature_2m_max', index),
    weatherCode: numberAt(dailyPayload, 'weather_code', index),
    precipitationProbabilityPercent: numberAt(dailyPayload, 'precipitation_probability_max', index),
  }));

  return {
    city,
    timezone,
    current,
    forecastDays,
  };
}
