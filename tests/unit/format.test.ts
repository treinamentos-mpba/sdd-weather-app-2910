import { describe, expect, it } from 'vitest';
import { formatForecastDay, getShortDate } from '../../src/lib/format';

describe('formatForecastDay', () => {
  it('rotula os dois primeiros dias como Hoje e Amanhã', () => {
    expect(formatForecastDay('2026-03-10', 0)).toBe('Hoje');
    expect(formatForecastDay('2026-03-11', 1)).toBe('Amanhã');
  });

  it('usa o dia da semana para os demais índices', () => {
    expect(formatForecastDay('2026-03-12', 2)).toBe('Quinta-feira');
  });

  it('informa quando a data é inválida para índices posteriores', () => {
    expect(formatForecastDay('2026-02-30', 2)).toBe('Data indisponível');
  });
});

describe('getShortDate', () => {
  it('formata a data local como DD/MM sem deslocamento de fuso', () => {
    expect(getShortDate('2026-03-10')).toBe('10/03');
  });

  it('informa quando a data é inválida', () => {
    expect(getShortDate('not-a-date')).toBe('Data indisponível');
  });
});
