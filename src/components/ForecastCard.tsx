import { formatForecastDay, getShortDate } from '../lib/format';
import { toDisplayTemperature } from '../lib/temperature';
import { getWeatherCodeInfo } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

function formatTemperature(valueC: number | undefined, unit: Unit): string {
  if (valueC === undefined || !Number.isFinite(valueC)) {
    return '—';
  }

  const value = toDisplayTemperature(valueC, unit);
  const unitLabel = unit === 'celsius' ? '°C' : '°F';

  return `${value} ${unitLabel}`;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const dayLabel = formatForecastDay(day.date, index);
  const shortDate = getShortDate(day.date);
  const weatherInfo = getWeatherCodeInfo(day.weatherCode);
  const precipitationProbability =
    day.precipitationProbabilityPercent === undefined ||
    !Number.isFinite(day.precipitationProbabilityPercent)
      ? '—'
      : `${numberFormatter.format(day.precipitationProbabilityPercent)}%`;

  return (
    <article
      aria-label={`Previsão para ${dayLabel}`}
      className="flex min-h-48 min-w-0 flex-col rounded-lg border border-white/10 bg-white/5 p-4 text-white backdrop-blur-md"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{dayLabel}</h3>
          <p className="mt-0.5 text-xs text-white/70">{shortDate}</p>
          <p className="mt-1 break-words text-sm text-white/85">{weatherInfo.description}</p>
        </div>
        <span aria-hidden="true" className="shrink-0 text-3xl leading-none">
          {weatherInfo.icon}
        </span>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-white/80">Máx.</p>
          <p className="mt-1 break-words text-base font-semibold tabular-nums sm:text-lg">
            {formatTemperature(day.maximumC, unit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/80">Mín.</p>
          <p className="mt-1 break-words text-base font-semibold tabular-nums sm:text-lg">
            {formatTemperature(day.minimumC, unit)}
          </p>
        </div>
      </div>

      <dl className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-4">
        <dt className="text-sm text-white/80">Chuva</dt>
        <dd className="text-sm font-medium tabular-nums">{precipitationProbability}</dd>
      </dl>
    </article>
  );
}
