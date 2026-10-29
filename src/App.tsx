import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import useWeather from './hooks/useWeather';
import type { City, Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const weather = useWeather();
  const resultsRegionRef = useRef<HTMLElement>(null);
  const previousStatusRef = useRef(weather.status);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = weather.status;

    if (previousStatus === 'loading' && weather.status !== 'loading') {
      resultsRegionRef.current?.focus();
    }
  }, [weather.status]);

  function getCityKey(city: City): string {
    return city.id === undefined ? `${city.latitude},${city.longitude}` : String(city.id);
  }

  function renderWeatherState() {
    switch (weather.status) {
      case 'idle':
        return (
          <EmptyState
            title="Consulte o clima de uma cidade"
            hint="Busque uma cidade para ver as condições atuais e a previsão."
          />
        );
      case 'loading':
        return <LoadingState message="Buscando clima..." />;
      case 'empty':
        return (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint="Confira o nome e tente buscar novamente."
          />
        );
      case 'error':
        return (
          <ErrorState
            message={weather.error?.message ?? 'Não foi possível carregar os dados do clima.'}
            onRetry={() => {
              void weather.retry();
            }}
          />
        );
      case 'success':
        if (!weather.data) {
          return (
            <ErrorState
              message="Não foi possível carregar os dados do clima."
              onRetry={() => {
                void weather.retry();
              }}
            />
          );
        }

        return (
          <div className="space-y-6">
            <CurrentWeather city={weather.data.city} current={weather.data.current} unit={unit} />
            <ForecastList forecastDays={weather.data.forecastDays} unit={unit} />
          </div>
        );
      default: {
        const exhaustiveCheck: never = weather.status;
        return exhaustiveCheck;
      }
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center">
          <div className="flex shrink-0 items-center gap-3">
            <span aria-hidden="true" className="text-3xl">
              ⛅
            </span>
            <h1 className="text-xl font-semibold">Clima</h1>
          </div>

          <div className="min-w-0 flex-1">
            <SearchBar
              onSearch={(name) => {
                void weather.search(name);
              }}
              disabled={weather.status === 'loading'}
            />
          </div>

          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {weather.cities.length > 1 && (
          <section aria-label="Resultados da busca" className="mb-6">
            <h2 className="mb-3 text-base font-semibold text-white">Escolha uma cidade</h2>
            <ul className="flex flex-wrap gap-2">
              {weather.cities.map((city) => {
                const isSelected =
                  weather.data !== null && getCityKey(weather.data.city) === getCityKey(city);
                const locationDetails = [city.adminArea, city.country]
                  .filter((value): value is string => Boolean(value))
                  .join(', ');

                return (
                  <li key={getCityKey(city)}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        void weather.selectCity(city);
                      }}
                      disabled={weather.status === 'loading'}
                      className="min-h-11 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/5"
                    >
                      <span className="block font-medium">{city.name}</span>
                      {locationDetails && (
                        <span className="block text-xs text-white/75">{locationDetails}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        <section
          ref={resultsRegionRef}
          aria-label="Resultado do clima"
          aria-busy={weather.status === 'loading'}
          tabIndex={-1}
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
        >
          {renderWeatherState()}
        </section>
      </main>
    </div>
  );
}
