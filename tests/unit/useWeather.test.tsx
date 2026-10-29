import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useWeather from '../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city: City = {
  id: 2267057,
  name: 'Lisboa',
  latitude: 38.72,
  longitude: -9.14,
  country: 'Portugal',
  timezone: 'Europe/Lisbon',
};

const weatherData: WeatherData = {
  city,
  timezone: 'Europe/Lisbon',
  current: { temperatureC: 18, weatherCode: 1 },
  forecastDays: [
    { date: '2026-10-29', minimumC: 12, maximumC: 20, weatherCode: 1 },
    { date: '2026-10-30', minimumC: 13, maximumC: 21, weatherCode: 2 },
    { date: '2026-10-31', minimumC: 14, maximumC: 22, weatherCode: 3 },
    { date: '2026-11-01', minimumC: 15, maximumC: 23, weatherCode: 0 },
    { date: '2026-11-02', minimumC: 14, maximumC: 22, weatherCode: 61 },
  ],
};

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useWeather com falha de rede', () => {
  it('expõe erro amigável de geocoding e retry repete a busca original', async () => {
    mockedSearchCities
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce([city]);
    mockedGetWeather.mockResolvedValue(weatherData);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(' Lisboa ');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatchObject({
      kind: 'network',
      message: 'Falha de rede.',
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(mockedSearchCities).toHaveBeenNthCalledWith(1, 'Lisboa');
    expect(mockedSearchCities).toHaveBeenNthCalledWith(2, 'Lisboa');
    expect(mockedGetWeather).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(weatherData);
    expect(result.current.error).toBeNull();
  });

  it('expõe falha offline do forecast e retry repete geocoding e forecast', async () => {
    mockedSearchCities.mockResolvedValue([city]);
    mockedGetWeather
      .mockRejectedValueOnce({ kind: 'network', message: 'Falha de rede.' })
      .mockResolvedValueOnce(weatherData);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatchObject({ kind: 'network', message: 'Falha de rede.' });

    await act(async () => {
      await result.current.retry();
    });

    expect(mockedSearchCities).toHaveBeenCalledTimes(2);
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(weatherData);
  });
});
