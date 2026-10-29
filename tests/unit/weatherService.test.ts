import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const fetchMock = vi.fn<typeof fetch>();
const city: City = {
  id: 123,
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('searchCities', () => {
  it('retorna lista vazia sem chamar fetch para input vazio', async () => {
    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia results para City e codifica o nome na URL', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    );

    await expect(searchCities('  São Paulo  ')).resolves.toEqual([
      {
        id: 3448439,
        name: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63,
        adminArea: 'São Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        timezone: 'America/Sao_Paulo',
      },
    ]);

    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('name=S%C3%A3o%20Paulo');
  });

  it('preserva acentos, espaços e apóstrofo no nome geocodificado', async () => {
    const cityName = "São José d'Oeste";
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: [
          {
            name: cityName,
            latitude: -27.82,
            longitude: -50.33,
          },
        ],
      }),
    );

    await expect(searchCities(cityName)).resolves.toMatchObject([{ name: cityName }]);

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.searchParams.get('name')).toBe(cityName);
  });

  it('retorna lista vazia quando results está ausente', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ generationtime_ms: 0.1 }));

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('retorna lista vazia quando results é um array vazio', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ results: [] }));

    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError para resposta HTTP não-ok', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reason: 'Service unavailable' }, 503));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      kind: 'http',
      status: 503,
    });
  });
});

describe('getWeather', () => {
  it('mapeia current e cinco itens dos arrays paralelos de daily', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-29T12:00',
          temperature_2m: 18.2,
          weather_code: 1,
          relative_humidity_2m: 72,
          wind_speed_10m: 12.4,
          precipitation: null,
          surface_pressure: 1013.2,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          temperature_2m_min: [12, 13, 14, 15, 16],
          temperature_2m_max: [21, 22, 23, 24, 25],
          weather_code: [1, 2, 3, 0, 61],
          precipitation_probability_max: [10, 20, 30, 40, 50],
        },
      }),
    );

    await expect(getWeather(city)).resolves.toEqual({
      city,
      timezone: 'America/Sao_Paulo',
      current: {
        observedAt: '2026-10-29T12:00',
        temperatureC: 18.2,
        weatherCode: 1,
        humidityPercent: 72,
        windSpeedKmh: 12.4,
        precipitationMm: 0,
        pressureHpa: 1013.2,
      },
      forecastDays: [
        {
          date: '2026-10-29',
          minimumC: 12,
          maximumC: 21,
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
          minimumC: 14,
          maximumC: 23,
          weatherCode: 3,
          precipitationProbabilityPercent: 30,
        },
        {
          date: '2026-11-01',
          minimumC: 15,
          maximumC: 24,
          weatherCode: 0,
          precipitationProbabilityPercent: 40,
        },
        {
          date: '2026-11-02',
          minimumC: 16,
          maximumC: 25,
          weatherCode: 61,
          precipitationProbabilityPercent: 50,
        },
      ],
    });
  });

  it('lança WeatherServiceError quando current está ausente', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        daily: { time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'] },
      }),
    );

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('lança WeatherServiceError quando daily está ausente', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        current: { temperature_2m: 18, weather_code: 1 },
      }),
    );

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('lança WeatherServiceError quando forecast contém menos de cinco datas', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        current: { temperature_2m: 18, weather_code: 1 },
        daily: { time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'] },
      }),
    );

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'invalid-response' });
  });

  it('classifica falha de rede como WeatherServiceError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getWeather(city)).rejects.toMatchObject({
      kind: 'network',
      message: 'Falha de rede.',
    });
  });

  it('preserva status HTTP em erro do forecast', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ reason: 'Service unavailable' }, 503));

    await expect(getWeather(city)).rejects.toMatchObject({ kind: 'http', status: 503 });
  });

  it('classifica timeout do forecast como WeatherServiceError', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );

    const requestAssertion = expect(getWeather(city)).rejects.toMatchObject({
      kind: 'timeout',
      message: 'A requisição demorou demais.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await requestAssertion;
  });

  it('preserva campos válidos em uma resposta meteorológica parcial', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        current: { temperature_2m: 17, weather_code: 2 },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          temperature_2m_min: [11, 12, 13, 14, 15],
        },
      }),
    );

    const weather = await getWeather(city);

    expect(weather.current).toMatchObject({ temperatureC: 17, weatherCode: 2 });
    expect(weather.current?.humidityPercent).toBeUndefined();
    expect(weather.forecastDays).toHaveLength(5);
    expect(weather.forecastDays[0]).toMatchObject({ date: '2026-10-29', minimumC: 11 });
    expect(weather.forecastDays[0]?.maximumC).toBeUndefined();
    expect(weather.forecastDays[0]?.precipitationProbabilityPercent).toBeUndefined();
  });

  it('converte campos nulos em valores ausentes, exceto precipitação null que é zero', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        current: {
          time: null,
          temperature_2m: null,
          weather_code: null,
          relative_humidity_2m: null,
          wind_speed_10m: null,
          precipitation: null,
          surface_pressure: null,
        },
        daily: {
          time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
          temperature_2m_min: [null, 12, 13, 14, 15],
          temperature_2m_max: [20, 21, 22, 23, 24],
          weather_code: [null, 1, 2, 3, 61],
          precipitation_probability_max: [null, 10, 20, 30, 40],
        },
      }),
    );

    const weather = await getWeather(city);

    expect(weather.current?.temperatureC).toBeUndefined();
    expect(weather.current?.weatherCode).toBeUndefined();
    expect(weather.current?.observedAt).toBeUndefined();
    expect(weather.current?.humidityPercent).toBeUndefined();
    expect(weather.current?.windSpeedKmh).toBeUndefined();
    expect(weather.current?.precipitationMm).toBe(0);
    expect(weather.current?.pressureHpa).toBeUndefined();
    expect(weather.forecastDays[0]).toMatchObject({ date: '2026-10-29', maximumC: 20 });
    expect(weather.forecastDays[0]?.minimumC).toBeUndefined();
    expect(weather.forecastDays[0]?.weatherCode).toBeUndefined();
    expect(weather.forecastDays[0]?.precipitationProbabilityPercent).toBeUndefined();
  });
});
