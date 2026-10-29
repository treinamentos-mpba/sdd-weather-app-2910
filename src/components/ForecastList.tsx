import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecastDays: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecastDays, unit }: ForecastListProps) {
  const headingId = useId();
  const visibleDays = forecastDays.slice(0, 5);

  return (
    <section aria-labelledby={headingId} className="w-full">
      <h2 id={headingId} className="mb-4 text-xl font-semibold text-white">
        Previsão para cinco dias
      </h2>

      {visibleDays.length === 0 ? (
        <p role="status" className="text-sm text-white/70">
          Previsão indisponível.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visibleDays.map((day, index) => (
            <ForecastCard key={day.date} day={day} index={index} unit={unit} />
          ))}
        </div>
      )}
    </section>
  );
}
