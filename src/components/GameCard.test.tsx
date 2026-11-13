import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameCard } from './GameCard';
import type { Game } from '../types/game';

const baseGame: Game = {
  id: '1',
  name: 'Hollow Knight',
  genre: 'Metroidvania',
  platform: 'PC',
  status: 'Jogando',
  rating: 4,
  createdAt: new Date().toISOString(),
};

function renderCard(game: Game = baseGame, overrides: Partial<Parameters<typeof GameCard>[0]> = {}) {
  const props = {
    game,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDetails: vi.fn(),
    ...overrides,
  };
  render(<GameCard {...props} />);
  return props;
}

describe('GameCard', () => {
  it('exibe o nome, o gênero, a plataforma e o status do jogo', () => {
    renderCard();

    expect(screen.getByRole('heading', { name: 'Hollow Knight' })).toBeInTheDocument();
    expect(screen.getByText('Metroidvania')).toBeInTheDocument();
    expect(screen.getByText('PC')).toBeInTheDocument();
    expect(screen.getByText('Jogando')).toBeInTheDocument();
  });

  it('mostra a nota em estrelas, com texto alternativo para leitor de tela', () => {
    renderCard();

    expect(screen.getByRole('img', { name: 'Nota 4 de 5' })).toBeInTheDocument();
  });

  it('não exibe a nota quando o jogo ainda não foi avaliado', () => {
    renderCard({ ...baseGame, rating: null });

    expect(screen.getByRole('heading', { name: 'Hollow Knight' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Nota/ })).not.toBeInTheDocument();
  });

  it('não mostra a linha de gênero quando o jogo não tem gênero', () => {
    renderCard({ ...baseGame, genre: '' });

    expect(screen.queryByText('Metroidvania')).not.toBeInTheDocument();
  });

  it('mostra a imagem da capa quando o jogo tem capa', () => {
    const { container } = render(
      <GameCard
        game={{ ...baseGame, coverUrl: 'https://exemplo.com/capa.jpg' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDetails={vi.fn()}
      />,
    );

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://exemplo.com/capa.jpg');
  });

  it('sem capa, mostra o nome no quadro cinza (além do título)', () => {
    const { container } = render(
      <GameCard game={baseGame} onEdit={vi.fn()} onDelete={vi.fn()} onDetails={vi.fn()} />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getAllByText('Hollow Knight')).toHaveLength(2);
  });

  it('abre os detalhes ao clicar no título', () => {
    const props = renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Hollow Knight' }));

    expect(props.onDetails).toHaveBeenCalledWith(baseGame);
  });

  it('chama onDelete com o id correto ao clicar no ícone de excluir', () => {
    const props = renderCard();

    fireEvent.click(screen.getByLabelText('Excluir Hollow Knight'));

    expect(props.onDelete).toHaveBeenCalledWith('1');
  });

  it('chama onEdit com o jogo ao clicar no ícone de editar', () => {
    const props = renderCard();

    fireEvent.click(screen.getByLabelText('Editar Hollow Knight'));

    expect(props.onEdit).toHaveBeenCalledWith(baseGame);
  });

  it('avança para o próximo status ao clicar no status', () => {
    const onStatusChange = vi.fn();
    renderCard(baseGame, { onStatusChange });

    fireEvent.click(screen.getByRole('button', { name: /Status de Hollow Knight/ }));

    expect(onStatusChange).toHaveBeenCalledWith('1', 'Zerado');
  });

  it('sem onStatusChange o status é só texto, não um botão', () => {
    renderCard();

    expect(screen.queryByRole('button', { name: /Status de/ })).not.toBeInTheDocument();
  });
});
