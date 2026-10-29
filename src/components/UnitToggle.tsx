import type { KeyboardEvent } from 'react';
import { useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let nextUnit: Unit | undefined;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      nextUnit = 'celsius';
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      nextUnit = 'fahrenheit';
    }

    if (!nextUnit) {
      return;
    }

    event.preventDefault();
    onChange(nextUnit);

    if (nextUnit === 'celsius') {
      celsiusButtonRef.current?.focus();
    } else {
      fahrenheitButtonRef.current?.focus();
    }
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-md"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        onClick={() => onChange('celsius')}
        onKeyDown={handleKeyDown}
        className={`min-h-10 min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'celsius'
            ? 'bg-accent-500 text-night-900'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={handleKeyDown}
        className={`min-h-10 min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
          unit === 'fahrenheit'
            ? 'bg-accent-500 text-night-900'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
      >
        °F
      </button>
    </div>
  );
}
