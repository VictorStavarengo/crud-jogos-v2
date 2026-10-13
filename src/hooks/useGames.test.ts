import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGames } from './useGames';
import { GAMES_STORAGE_KEY } from '../constants/storageKeys';
import type { Game, GameInput } from '../types/game';

const sampleInput: GameInput = {
  name: 'Celeste',
  genre: 'Plataforma',
  platform: 'Switch',
  status: 'Zerado',
  rating: 5,
};

describe('useGames', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('começa vazio quando não há dados salvos', () => {
    const { result } = renderHook(() => useGames());
    expect(result.current.games).toHaveLength(0);
  });

  it('adiciona um jogo com id e data de criação gerados', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });

    expect(result.current.games).toHaveLength(1);
    expect(result.current.games[0]).toMatchObject(sampleInput);
    expect(result.current.games[0].id).toBeTruthy();
  });

  it('atualiza um jogo existente', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });
    const id = result.current.games[0].id;

    act(() => {
      result.current.updateGame(id, { rating: 3 });
    });

    expect(result.current.games[0].rating).toBe(3);
  });

  it('remove um jogo pelo id', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });
    const id = result.current.games[0].id;

    act(() => {
      result.current.removeGame(id);
    });

    expect(result.current.games).toHaveLength(0);
  });

  it('restaura um jogo removido na mesma posição', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
      result.current.addGame({ ...sampleInput, name: 'Hades' });
    });
    const removed = result.current.games[0]; // Hades (o mais recente fica primeiro)

    act(() => {
      result.current.removeGame(removed.id);
    });
    expect(result.current.games.map((g) => g.name)).toEqual(['Celeste']);

    act(() => {
      result.current.restoreGame(removed, 0);
    });
    expect(result.current.games.map((g) => g.name)).toEqual(['Hades', 'Celeste']);
  });

  it('não duplica o jogo se restaurar duas vezes', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });
    const game = result.current.games[0];

    act(() => {
      result.current.restoreGame(game, 0);
    });

    expect(result.current.games).toHaveLength(1);
  });

  it('reordena: o jogo arrastado assume a posição do jogo de destino', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame({ ...sampleInput, name: 'C' });
      result.current.addGame({ ...sampleInput, name: 'B' });
      result.current.addGame({ ...sampleInput, name: 'A' });
    });
    expect(result.current.games.map((g) => g.name)).toEqual(['A', 'B', 'C']);

    const [a, , c] = result.current.games;
    act(() => {
      result.current.reorderGames(a.id, c.id);
    });

    expect(result.current.games.map((g) => g.name)).toEqual(['B', 'C', 'A']);
  });

  it('ignora a reordenação quando algum id não existe', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });
    const before = result.current.games;

    act(() => {
      result.current.reorderGames('nao-existe', before[0].id);
    });

    expect(result.current.games).toEqual(before);
  });

  it('importa só os jogos novos e informa quantos foram ignorados', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });
    const existing = result.current.games[0];
    const incoming: Game[] = [existing, { ...existing, id: 'novo', name: 'Hades' }];

    const outcome = { added: 0, skipped: 0 };
    act(() => {
      Object.assign(outcome, result.current.importGames(incoming));
    });

    expect(outcome).toEqual({ added: 1, skipped: 1 });
    expect(result.current.games.map((g) => g.name)).toEqual(['Celeste', 'Hades']);
  });

  it('salva os jogos no localStorage no formato versionado', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });

    const saved = JSON.parse(localStorage.getItem(GAMES_STORAGE_KEY) ?? 'null');
    expect(saved.version).toBe(2);
    expect(saved.games).toHaveLength(1);
  });

  it('carrega jogos salvos e migra o formato antigo (nota 0 vira sem nota)', () => {
    localStorage.setItem(
      GAMES_STORAGE_KEY,
      JSON.stringify([
        {
          id: '1',
          name: 'Zelda',
          genre: 'Aventura',
          platform: 'Switch',
          status: 'Zerado',
          rating: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    );

    const { result } = renderHook(() => useGames());

    expect(result.current.games).toHaveLength(1);
    expect(result.current.games[0].name).toBe('Zelda');
    expect(result.current.games[0].rating).toBeNull();
  });

  it('ignora dados corrompidos e começa vazio, sem quebrar', () => {
    localStorage.setItem(GAMES_STORAGE_KEY, 'isso não é json {{{');

    const { result } = renderHook(() => useGames());

    expect(result.current.games).toHaveLength(0);
  });
});
