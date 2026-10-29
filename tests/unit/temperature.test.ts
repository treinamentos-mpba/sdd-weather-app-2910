import { describe, expect, it } from 'vitest';
import {
  convertTemperature,
  formatTemperature,
  toDisplayTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it('converte os pontos de referência de Celsius para Fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('mantém Celsius e converte Fahrenheit conforme a unidade solicitada', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
    expect(convertTemperature(20, 'fahrenheit')).toBe(68);
  });
});

describe('formatTemperature', () => {
  it('arredonda a temperatura e inclui o símbolo da unidade', () => {
    expect(formatTemperature(20.4, 'celsius')).toBe('20 °C');
    expect(formatTemperature(20.5, 'celsius')).toBe('21 °C');
    expect(formatTemperature(-1.5, 'celsius')).toBe('-2 °C');
    expect(formatTemperature(20.25, 'fahrenheit')).toBe('68 °F');
  });

  it('indica quando a temperatura não está disponível', () => {
    expect(formatTemperature(undefined, 'celsius')).toBe('Indisponível');
  });
});

describe('toDisplayTemperature', () => {
  it('mantém a conversão arredondada usada pelos componentes atuais', () => {
    expect(toDisplayTemperature(20.5, 'celsius')).toBe(21);
    expect(toDisplayTemperature(-1.5, 'celsius')).toBe(-2);
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo da unidade selecionada', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
