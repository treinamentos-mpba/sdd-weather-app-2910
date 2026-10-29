import type { Unit } from '../types/weather';

export function convertTemperature(valueC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (valueC * 9) / 5 + 32 : valueC;
}

export function unitLabel(unit: Unit): '°C' | '°F' {
  return unit === 'celsius' ? '°C' : '°F';
}

function roundForDisplay(value: number): number {
  const sign = value < 0 ? -1 : 1;

  return sign * Math.floor(Math.abs(value) + 0.5);
}

export function formatTemperature(valueC: number | undefined, unit: Unit): string {
  if (valueC === undefined || !Number.isFinite(valueC)) {
    return 'Indisponível';
  }

  const displayValue = roundForDisplay(convertTemperature(valueC, unit));
  return `${displayValue} ${unitLabel(unit)}`;
}

export function toDisplayTemperature(valueC: number, unit: Unit): number {
  return roundForDisplay(convertTemperature(valueC, unit));
}
