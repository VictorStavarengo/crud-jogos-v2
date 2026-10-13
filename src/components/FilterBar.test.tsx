import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar } from './FilterBar';
import { DEFAULT_FILTERS } from '../utils/gameFilters';

const counts = { 'Quero jogar': 2, Jogando: 1, Zerado: 3, Abandonado: 0 };

function setup(overrides: Partial<Parameters<typeof FilterBar>[0]> = {}) {
  const props = {
    filters: DEFAULT_FILTERS,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    sort: 'manual' as const,
    onSortChange: vi.fn(),
    counts,
    total: 6,
    platforms: ['PC', 'Switch'],
    genres: ['RPG'],
    ...overrides,
  };
  render(<FilterBar {...props} />);
  return props;
}

describe('FilterBar', () => {
  it('filtra por status ao clicar num chip', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: /Jogando/ }));

    expect(props.onFilterChange).toHaveBeenCalledWith({ status: 'Jogando' });
  });

  it('marca o chip ativo e mostra as contagens', () => {
    setup({ filters: { ...DEFAULT_FILTERS, status: 'Zerado' } });

    expect(screen.getByRole('button', { name: /Zerado/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^Todos/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /^Todos/ })).toHaveTextContent('6');
  });

  it('avisa quando a busca muda e permite limpar', () => {
    const props = setup({ filters: { ...DEFAULT_FILTERS, search: 'zel' } });

    fireEvent.change(screen.getByLabelText('Buscar jogo por título'), {
      target: { value: 'zelda' },
    });
    expect(props.onFilterChange).toHaveBeenCalledWith({ search: 'zelda' });

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(props.onFilterChange).toHaveBeenLastCalledWith({ search: '' });
  });

  it('não mostra o botão de limpar com a busca vazia', () => {
    setup();

    expect(screen.queryByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument();
  });

  it('filtra por plataforma pelo menu', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: /Plataforma/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Switch' }));

    expect(props.onFilterChange).toHaveBeenCalledWith({ platform: 'Switch' });
  });

  it('troca a ordenação pelo menu', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: /Ordenar/ }));
    fireEvent.click(screen.getByRole('option', { name: 'Maior nota' }));

    expect(props.onSortChange).toHaveBeenCalledWith('rating');
  });

  it('esconde os menus de plataforma e gênero quando não há opções', () => {
    setup({ platforms: [], genres: [] });

    expect(screen.queryByRole('button', { name: /Plataforma/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gênero/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ordenar/ })).toBeInTheDocument();
  });

  it('mostra "Limpar filtros" só quando há filtro ativo', () => {
    const props = setup({ filters: { ...DEFAULT_FILTERS, platform: 'PC' } });

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(props.onClearFilters).toHaveBeenCalled();
  });

  it('não mostra "Limpar filtros" sem filtros ativos', () => {
    setup();

    expect(screen.queryByRole('button', { name: 'Limpar filtros' })).not.toBeInTheDocument();
  });
});
