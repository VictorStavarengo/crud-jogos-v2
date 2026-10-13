import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameDetailsModal } from './GameDetailsModal';
import type { Game } from '../types/game';

const game: Game = {
  id: '1',
  name: 'Elden Ring',
  genre: 'RPG',
  platform: 'PC',
  status: 'Jogando',
  rating: 5,
  notes: 'Cheguei em Leyndell.',
  createdAt: '2026-03-10T12:00:00.000Z',
};

describe('GameDetailsModal', () => {
  it('é um diálogo modal nomeado pelo título do jogo, com os dados do jogo', () => {
    render(<GameDetailsModal game={game} onClose={vi.fn()} onEdit={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Elden Ring' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('RPG · PC')).toBeInTheDocument();
    expect(screen.getByText('Cheguei em Leyndell.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nota 5 de 5')).toBeInTheDocument();
  });

  it('leva o foco para dentro da janela ao abrir', () => {
    render(<GameDetailsModal game={game} onClose={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Fechar detalhes' })).toHaveFocus();
  });

  it('fecha com Esc', () => {
    const onClose = vi.fn();
    render(<GameDetailsModal game={game} onClose={onClose} onEdit={vi.fn()} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('fecha ao clicar no fundo, mas não ao clicar dentro da janela', () => {
    const onClose = vi.fn();
    render(<GameDetailsModal game={game} onClose={onClose} onEdit={vi.fn()} />);

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chama onEdit com o jogo ao clicar em Editar', () => {
    const onEdit = vi.fn();
    render(<GameDetailsModal game={game} onClose={vi.fn()} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(onEdit).toHaveBeenCalledWith(game);
  });

  it('mantém o Tab dentro da janela (do último botão volta ao primeiro)', () => {
    render(<GameDetailsModal game={game} onClose={vi.fn()} onEdit={vi.fn()} />);

    const lastButton = screen.getByRole('button', { name: 'Fechar' });
    lastButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(screen.getByRole('button', { name: 'Fechar detalhes' })).toHaveFocus();
  });

  it('devolve o foco ao elemento que abriu quando fecha', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(<GameDetailsModal game={game} onClose={vi.fn()} onEdit={vi.fn()} />);
    expect(opener).not.toHaveFocus();

    unmount();

    expect(opener).toHaveFocus();
    opener.remove();
  });

  it('mostra um aviso quando não há observações e quando não há nota', () => {
    render(
      <GameDetailsModal game={{ ...game, notes: undefined, rating: null }} onClose={vi.fn()} onEdit={vi.fn()} />,
    );

    expect(screen.getByText('Sem nota')).toBeInTheDocument();
    expect(screen.getByText(/ainda não escreveu nada/)).toBeInTheDocument();
  });
});
