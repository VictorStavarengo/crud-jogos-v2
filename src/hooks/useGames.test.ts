import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('substitui a biblioteca inteira e permite voltar à lista anterior', () => {
    const { result } = renderHook(() => useGames());

    act(() => {
      result.current.addGame(sampleInput);
    });
    const previous = result.current.games;
    const replacement: Game[] = [{ ...previous[0], id: 'outro', name: 'Hades' }];

    act(() => {
      result.current.replaceGames(replacement);
    });
    expect(result.current.games.map((g) => g.name)).toEqual(['Hades']);

    act(() => {
      result.current.replaceGames(previous);
    });
    expect(result.current.games.map((g) => g.name)).toEqual(['Celeste']);
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

describe('useGames — datas ao mudar de status', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 11, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setupWishlistGame() {
    const hook = renderHook(() => useGames());
    act(() => {
      hook.result.current.addGame({ ...sampleInput, status: 'Quero jogar', rating: null });
    });
    return { result: hook.result, id: hook.result.current.games[0].id };
  }

  it('marca o início ao passar a "Jogando" e o término ao zerar', () => {
    const { result, id } = setupWishlistGame();

    act(() => result.current.updateGame(id, { status: 'Jogando' }));
    expect(result.current.games[0]).toMatchObject({ status: 'Jogando', startedAt: '2026-11-11' });

    vi.setSystemTime(new Date(2026, 10, 20, 12, 0, 0));
    act(() => result.current.updateGame(id, { status: 'Zerado' }));
    expect(result.current.games[0]).toMatchObject({
      status: 'Zerado',
      startedAt: '2026-11-11',
      finishedAt: '2026-11-20',
    });
  });

  it('não troca um início que já estava registrado', () => {
    const { result, id } = setupWishlistGame();
    act(() => result.current.updateGame(id, { startedAt: '2026-01-01' }));

    act(() => result.current.updateGame(id, { status: 'Jogando' }));

    expect(result.current.games[0].startedAt).toBe('2026-01-01');
  });

  it('uma edição completa com datas não é alterada pelo preenchimento automático', () => {
    const { result, id } = setupWishlistGame();

    act(() =>
      result.current.updateGame(id, { ...sampleInput, status: 'Zerado', startedAt: '2026-10-01', finishedAt: '2026-10-20' }),
    );

    expect(result.current.games[0]).toMatchObject({ startedAt: '2026-10-01', finishedAt: '2026-10-20' });
  });

  it('uma edição que apaga as datas é respeitada', () => {
    const { result, id } = setupWishlistGame();

    act(() => result.current.updateGame(id, { status: 'Zerado', startedAt: undefined, finishedAt: undefined }));

    expect(result.current.games[0].finishedAt).toBeUndefined();
  });

  it('mudar outra coisa que não o status não mexe nas datas', () => {
    const { result, id } = setupWishlistGame();

    act(() => result.current.updateGame(id, { rating: 3 }));

    expect(result.current.games[0].startedAt).toBeUndefined();
  });
});
