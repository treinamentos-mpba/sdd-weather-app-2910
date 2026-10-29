import { toDisplayTemperature } from '../lib/temperature';
import { getWeatherCodeInfo } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData | null;
  unit: Unit;
}

interface WeatherMetric {
  label: string;
  value: string;
}

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

function formatMetric(value: number | undefined, unit: string): string {
  if (value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  return `${numberFormatter.format(value)}${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const locationDetails = [city.adminArea, city.country]
    .filter((value): value is string => Boolean(value))
    .join(', ');

  const weatherInfo = current ? getWeatherCodeInfo(current.weatherCode) : null;
  const temperature =
    current?.temperatureC === undefined || !Number.isFinite(current.temperatureC)
      ? undefined
      : toDisplayTemperature(current.temperatureC, unit);
  const temperatureUnit = unit === 'celsius' ? '°C' : '°F';
  const metrics: WeatherMetric[] = [
    { label: 'Umidade', value: formatMetric(current?.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current?.windSpeedKmh, ' km/h') },
    { label: 'Precipitação', value: formatMetric(current?.precipitationMm, ' mm') },
    { label: 'Pressão', value: formatMetric(current?.pressureHpa, ' hPa') },
  ];

  return (
    <section
      aria-label={`Clima atual em ${city.name}`}
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-lg backdrop-blur-md sm:p-7"
    >
      <header>
        <p className="text-sm font-medium text-white/70">Clima atual</p>
        <h2 className="mt-1 text-2xl font-semibold">{city.name}</h2>
        {locationDetails && <p className="mt-1 text-sm text-white/80">{locationDetails}</p>}
      </header>

      {current === null ? (
        <p role="status" className="mt-6 text-white/75">
          Dados atuais indisponíveis.
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span aria-hidden="true" className="shrink-0 text-5xl leading-none sm:text-6xl">
                {weatherInfo?.icon}
              </span>
              <p className="min-w-0 break-words text-base text-white/85">
                {weatherInfo?.description}
              </p>
            </div>
            <p
              className={`max-w-full break-words font-semibold leading-tight tabular-nums ${
                temperature === undefined ? 'text-2xl sm:text-3xl' : 'text-6xl sm:text-7xl'
              }`}
            >
              {temperature === undefined ? 'Indisponível' : `${temperature}${temperatureUnit}`}
            </p>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="text-sm text-white/80">{metric.label}</dt>
                <dd className="mt-1 break-words text-lg font-medium text-white">{metric.value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  );
}
