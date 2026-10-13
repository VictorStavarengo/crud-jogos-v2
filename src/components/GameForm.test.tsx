import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameForm } from './GameForm';
import type { Game } from '../types/game';

const existingGame: Game = {
  id: '1',
  name: 'Hollow Knight',
  genre: 'Metroidvania',
  platform: 'PC',
  status: 'Jogando',
  rating: 4,
  createdAt: new Date().toISOString(),
};

describe('GameForm', () => {
  beforeEach(() => {
    // Garante o cenário "sem chave da RAWG", independente do .env.local de quem roda.
    vi.stubEnv('VITE_RAWG_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('permite cadastrar um jogo manualmente, sem a RAWG', () => {
    const onSubmit = vi.fn();
    render(<GameForm editingGame={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nome do jogo'), { target: { value: 'Jogo Indie' } });
    fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));

    // Etapa 2: o nome digitado já vem preenchido.
    expect(screen.getByLabelText('Nome')).toHaveValue('Jogo Indie');

    fireEvent.change(screen.getByLabelText('Gênero'), { target: { value: 'Puzzle' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jogo Indie', genre: 'Puzzle', status: 'Quero jogar' }),
    );
  });

  it('volta para a busca depois de adicionar um jogo', () => {
    render(<GameForm editingGame={null} onSubmit={vi.fn()} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nome do jogo'), { target: { value: 'Celeste' } });
    fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(screen.getByLabelText('Nome do jogo')).toHaveValue('');
  });

  it('não envia com o nome em branco e explica o motivo', () => {
    const onSubmit = vi.fn();
    render(<GameForm editingGame={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('O nome do jogo é obrigatório.');
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Nome')).toHaveFocus();
  });

  it('o aviso de nome obrigatório some assim que a pessoa digita', () => {
    render(<GameForm editingGame={null} onSubmit={vi.fn()} onCancelEdit={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Celeste' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mostra o erro devolvido pelo pai (ex.: jogo duplicado) e continua no formulário', () => {
    const onSubmit = vi.fn().mockReturnValue('Esse jogo já está na sua biblioteca.');
    render(<GameForm editingGame={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nome do jogo'), { target: { value: 'Celeste' } });
    fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Esse jogo já está na sua biblioteca.');
    expect(screen.getByLabelText('Nome')).toHaveValue('Celeste');
  });

  it('permite escolher status e nota pelos controles', () => {
    const onSubmit = vi.fn();
    render(<GameForm editingGame={null} onSubmit={onSubmit} onCancelEdit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nome do jogo'), { target: { value: 'Hades' } });
    fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));
    fireEvent.click(screen.getByLabelText('Zerado'));
    fireEvent.click(screen.getByLabelText('5 de 5'));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Hades', status: 'Zerado', rating: 5 }));
  });

  it('ao editar, abre direto nos detalhes com os dados do jogo', () => {
    render(<GameForm editingGame={existingGame} onSubmit={vi.fn()} onCancelEdit={vi.fn()} />);

    expect(screen.getByLabelText('Nome')).toHaveValue('Hollow Knight');
    expect(screen.getByLabelText('Plataforma')).toHaveValue('PC');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeInTheDocument();
  });
});
