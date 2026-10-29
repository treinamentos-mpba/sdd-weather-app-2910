import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('não chama onSearch quando o input está vazio', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.submit(screen.getByRole('search', { name: 'Buscar cidade' }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('não chama onSearch quando o input contém só espaços', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Cidade' }), {
      target: { value: '   ' },
    });
    fireEvent.submit(screen.getByRole('search', { name: 'Buscar cidade' }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('chama onSearch com o termo aparado', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), '  Lisboa  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Lisboa');
  });
});
