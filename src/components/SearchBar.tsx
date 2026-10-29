import type { FormEvent } from 'react';
import { useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const [city, setCity] = useState('');
  const trimmedCity = city.trim();
  const submitDisabled = disabled || trimmedCity.length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitDisabled) {
      return;
    }

    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-end"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-medium text-white/85">
          Cidade
        </label>
        <input
          id={inputId}
          name="city"
          type="search"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Ex.: São Paulo"
          disabled={disabled}
          className="min-h-11 w-full rounded-md border border-white/10 bg-night-900/70 px-3 py-2 text-base text-white placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={submitDisabled}
        className="min-h-11 rounded-md bg-accent-500 px-5 py-2 font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent-500"
      >
        Buscar
      </button>
    </form>
  );
}
