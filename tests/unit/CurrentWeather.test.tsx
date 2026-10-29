import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';

const city = {
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

describe('CurrentWeather com dados parciais', () => {
  it('mantém a condição disponível e identifica temperatura ausente', () => {
    render(<CurrentWeather city={city} current={{ weatherCode: 0 }} unit="celsius" />);

    const weatherRegion = screen.getByRole('region', { name: 'Clima atual em São Paulo' });
    expect(within(weatherRegion).getByText('Céu limpo')).toBeInTheDocument();
    expect(within(weatherRegion).getByText('Indisponível')).toBeInTheDocument();
    expect(within(weatherRegion).getAllByText('—')).toHaveLength(4);
  });

  it('exibe temperatura válida mesmo quando métricas opcionais não foram retornadas', () => {
    render(
      <CurrentWeather city={city} current={{ temperatureC: 18, weatherCode: 2 }} unit="celsius" />,
    );

    const weatherRegion = screen.getByRole('region', { name: 'Clima atual em São Paulo' });
    expect(within(weatherRegion).getByText('18°C')).toBeInTheDocument();
    expect(within(weatherRegion).getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(within(weatherRegion).getByText('Umidade')).toBeInTheDocument();
    expect(within(weatherRegion).getAllByText('—')).toHaveLength(4);
  });

  it('não exibe NaN ou Infinity quando a resposta contém números não finitos', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureC: Number.NaN,
          weatherCode: 0,
          humidityPercent: Number.NaN,
          windSpeedKmh: Number.POSITIVE_INFINITY,
          pressureHpa: Number.NEGATIVE_INFINITY,
        }}
        unit="celsius"
      />,
    );

    const weatherRegion = screen.getByRole('region', { name: 'Clima atual em São Paulo' });
    expect(within(weatherRegion).getByText('Indisponível')).toBeInTheDocument();
    expect(within(weatherRegion).getAllByText('—')).toHaveLength(4);
    expect(within(weatherRegion).queryByText(/NaN|Infinity|undefined/)).not.toBeInTheDocument();
  });
});
