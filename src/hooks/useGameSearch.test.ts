import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RawgRateLimitError, searchGames } from '../services/rawgApi';
import { useGameSearch } from './useGameSearch';

vi.mock('../services/rawgApi', () => ({
  isRawgConfigured: () => true,
  searchGames: vi.fn(),
  RawgRateLimitError: class RawgRateLimitError extends Error {},
}));

const searchMock = vi.mocked(searchGames);
const zelda = { id: 1, name: 'Zelda', background_image: null };

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('useGameSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    searchMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fica ocioso com o campo vazio e não chama a API', async () => {
    const { result } = renderHook(() => useGameSearch(''));

    await advance(1000);

    expect(result.current).toEqual({ results: [], status: 'idle' });
    expect(searchMock).not.toHaveBeenCalled();
  });

  it('espera o debounce antes de buscar e depois devolve os resultados', async () => {
    searchMock.mockResolvedValue([zelda]);
    const { result, rerender } = renderHook(({ query }) => useGameSearch(query), {
      initialProps: { query: '' },
    });

    rerender({ query: 'zelda' });
    expect(result.current.status).toBe('loading');

    await advance(300);
    expect(searchMock).not.toHaveBeenCalled();

    await advance(100);
    expect(searchMock).toHaveBeenCalledWith('zelda', expect.any(AbortSignal));
    expect(result.current).toEqual({ results: [zelda], status: 'success' });
  });

  it('só busca o último texto digitado (o debounce descarta os intermediários)', async () => {
    searchMock.mockResolvedValue([zelda]);
    const { rerender } = renderHook(({ query }) => useGameSearch(query), {
      initialProps: { query: '' },
    });

    rerender({ query: 'ze' });
    await advance(200);
    rerender({ query: 'zelda' });
    await advance(400);

    expect(searchMock).toHaveBeenCalledTimes(1);
    expect(searchMock).toHaveBeenCalledWith('zelda', expect.any(AbortSignal));
  });

  it('indica erro quando a API falha', async () => {
    searchMock.mockRejectedValue(new Error('falhou'));
    const { result, rerender } = renderHook(({ query }) => useGameSearch(query), {
      initialProps: { query: '' },
    });

    rerender({ query: 'zelda' });
    await advance(400);

    expect(result.current).toEqual({ results: [], status: 'error' });
  });

  it('indica limite de requisições quando a API responde 429', async () => {
    searchMock.mockRejectedValue(new RawgRateLimitError());
    const { result, rerender } = renderHook(({ query }) => useGameSearch(query), {
      initialProps: { query: '' },
    });

    rerender({ query: 'zelda' });
    await advance(400);

    expect(result.current.status).toBe('limited');
  });

  it('cancela a requisição anterior quando o texto muda', async () => {
    let firstSignal: AbortSignal | undefined;
    searchMock.mockImplementationOnce((_query, signal) => {
      firstSignal = signal;
      return new Promise<never>(() => undefined); // nunca termina
    });
    searchMock.mockResolvedValue([zelda]);

    const { rerender } = renderHook(({ query }) => useGameSearch(query), {
      initialProps: { query: '' },
    });

    rerender({ query: 'ze' });
    await advance(400);
    expect(firstSignal?.aborted).toBe(false);

    rerender({ query: 'zelda' });
    await advance(400);

    expect(firstSignal?.aborted).toBe(true);
  });
});
