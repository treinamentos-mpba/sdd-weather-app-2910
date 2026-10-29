import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';

describe('ForecastCard com valores ausentes ou inválidos', () => {
  it('mostra traço para métricas ausentes ou não finitas sem expor NaN', () => {
    render(
      <ForecastCard
        day={{
          date: '2026-03-10',
          minimumC: Number.NaN,
          maximumC: undefined,
          weatherCode: 999,
          precipitationProbabilityPercent: Number.POSITIVE_INFINITY,
        }}
        index={0}
        unit="celsius"
      />,
    );

    const card = screen.getByRole('article', { name: 'Previsão para Hoje' });
    expect(within(card).getAllByText('—')).toHaveLength(3);
    expect(within(card).getByText('Condição indisponível')).toBeInTheDocument();
    expect(within(card).queryByText(/NaN|Infinity|undefined/)).not.toBeInTheDocument();
  });
});
