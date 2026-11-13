import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('escolhe a nota ao clicar numa estrela', () => {
    const onChange = vi.fn();
    render(<StarRating value={null} onChange={onChange} />);

    expect(screen.getByText('Sem nota')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('4 de 5'));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('mostra a nota atual e permite limpar', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);

    expect(screen.getByLabelText('3 de 5')).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('não mostra o botão de limpar quando não há nota', () => {
    render(<StarRating value={null} onChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Limpar' })).not.toBeInTheDocument();
  });
});
