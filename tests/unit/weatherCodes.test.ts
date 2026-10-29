import { describe, expect, it } from 'vitest';
import { getWeatherCodeInfo } from '../../src/lib/weatherCodes';

describe('getWeatherCodeInfo', () => {
  it('retorna a condição e o ícone para um código conhecido', () => {
    expect(getWeatherCodeInfo(0)).toEqual({
      description: 'Céu limpo',
      icon: '☀️',
    });
  });

  it('retorna fallback para código desconhecido ou ausente', () => {
    const fallback = {
      description: 'Condição indisponível',
      icon: '？',
    };

    expect(getWeatherCodeInfo(999)).toEqual(fallback);
    expect(getWeatherCodeInfo()).toEqual(fallback);
  });
});
