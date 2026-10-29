export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  adminArea?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC?: number;
  weatherCode?: number;
  observedAt?: string;
  humidityPercent?: number;
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
}

export interface ForecastDay {
  date: string;
  minimumC?: number;
  maximumC?: number;
  weatherCode?: number;
  precipitationProbabilityPercent?: number;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather | null;
  forecastDays: ForecastDay[];
}

export type WeatherServiceErrorKind = 'network' | 'http' | 'timeout' | 'invalid-response';

export interface WeatherServiceError {
  kind: WeatherServiceErrorKind;
  message?: string;
  status?: number;
  retryAfterSeconds?: number;
}

export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: WeatherServiceError };
