import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
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
  forecastDays: [],
};

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('marca o resultado como ocupado e move o foco após a busca terminar', async () => {
    let resolveSearch: ((cities: City[]) => void) | undefined;
    mockedSearchCities.mockImplementation(
      () =>
        new Promise<City[]>((resolve) => {
          resolveSearch = resolve;
        }),
    );
    mockedGetWeather.mockResolvedValue(weatherData);

    const user = userEvent.setup();
    render(<App />);

    const resultRegion = screen.getByRole('region', { name: 'Resultado do clima' });
    await user.type(screen.getByLabelText('Cidade'), 'Lisboa');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(resultRegion).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveSearch?.([city]);
    });

    await waitFor(() => expect(resultRegion).toHaveAttribute('aria-busy', 'false'));
    await waitFor(() => expect(resultRegion).toHaveFocus());
    expect(screen.getByRole('region', { name: 'Clima atual em Lisboa' })).toBeVisible();
  });
});
