import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastCard from '../../src/components/ForecastCard';
import UnitToggle from '../../src/components/UnitToggle';
import type { ForecastDay, Unit } from '../../src/types/weather';

const forecastDay: ForecastDay = {
  date: '2026-10-29',
  minimumC: -40,
  maximumC: 100,
  weatherCode: 0,
};

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={{ name: 'São Paulo', latitude: -23.55, longitude: -46.63 }}
        current={{ temperatureC: 0, weatherCode: 0 }}
        unit={unit}
      />
      <ForecastCard day={forecastDay} index={0} unit={unit} />
    </>
  );
}

describe('UnitToggle com CurrentWeather', () => {
  it('exibe 32°F após selecionar Fahrenheit para 0°C', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });
    const fahrenheitButton = within(group).getByRole('button', { name: 'Fahrenheit' });
    await user.click(fahrenheitButton);

    expect(fahrenheitButton).toHaveAttribute('aria-pressed', 'true');
    const weatherRegion = screen.getByRole('region', { name: 'Clima atual em São Paulo' });
    expect(within(weatherRegion).getByText('32°F')).toBeInTheDocument();
  });

  it('converte máximas e mínimas da previsão para Fahrenheit', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    const forecastCard = screen.getByRole('article', { name: 'Previsão para Hoje' });
    expect(within(forecastCard).getByText('-40 °F')).toBeInTheDocument();
    expect(within(forecastCard).getByText('212 °F')).toBeInTheDocument();
  });
});
