import { useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData, WeatherServiceError } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { kind: 'search'; name: string } | { kind: 'selectCity'; city: City };

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherServiceError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isWeatherServiceError(value: unknown): value is WeatherServiceError {
  return (
    isRecord(value) &&
    (value.kind === 'network' ||
      value.kind === 'http' ||
      value.kind === 'timeout' ||
      value.kind === 'invalid-response')
  );
}

function toWeatherServiceError(value: unknown): WeatherServiceError {
  if (isWeatherServiceError(value)) {
    return value;
  }

  return { kind: 'network', message: 'Falha de rede.' };
}

export default function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  async function loadWeather(city: City, currentRequestId: number): Promise<void> {
    try {
      const weatherData = await getWeather(city);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setData(weatherData);
      setStatus('success');
      setError(null);
    } catch (caughtError) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setData(null);
      setError(toWeatherServiceError(caughtError));
      setStatus('error');
    }
  }

  async function runSearch(name: string): Promise<void> {
    const normalizedName = name.trim();
    const currentRequestId = ++requestId.current;

    lastOperation.current = { kind: 'search', name };
    setQuery(name);
    setData(null);
    setCities([]);
    setError(null);

    if (!normalizedName) {
      setStatus('empty');
      return;
    }

    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setCities(results);
      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      await loadWeather(results[0], currentRequestId);
    } catch (caughtError) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setData(null);
      setError(toWeatherServiceError(caughtError));
      setStatus('error');
    }
  }

  async function runSelectCity(city: City): Promise<void> {
    const currentRequestId = ++requestId.current;

    lastOperation.current = { kind: 'selectCity', city };
    setQuery(city.name);
    setData(null);
    setError(null);
    setStatus('loading');

    await loadWeather(city, currentRequestId);
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) {
      return;
    }

    if (operation.kind === 'search') {
      await runSearch(operation.name);
      return;
    }

    await runSelectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search: runSearch,
    selectCity: runSelectCity,
    retry,
  };
}
