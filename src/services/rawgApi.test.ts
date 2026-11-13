import { afterEach, describe, expect, it, vi } from 'vitest';
import { isRawgConfigured, RawgRateLimitError, searchGames } from './rawgApi';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('rawgApi', () => {
  it('não chama a API e devolve lista vazia sem chave configurada', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(isRawgConfigured()).toBe(false);
    await expect(searchGames('zelda')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('busca na API com a chave e devolve os resultados', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'abc123');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ id: 1, name: 'Zelda', background_image: null }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const results = await searchGames('  zelda  ');

    expect(results).toHaveLength(1);
    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get('key')).toBe('abc123');
    expect(url.searchParams.get('search')).toBe('zelda');
  });

  it('lança um erro específico quando o limite de requisições é atingido (429)', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'abc123');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));

    await expect(searchGames('zelda')).rejects.toBeInstanceOf(RawgRateLimitError);
  });

  it('lança erro genérico quando a resposta não é ok', async () => {
    vi.stubEnv('VITE_RAWG_API_KEY', 'abc123');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const promise = searchGames('zelda');

    await expect(promise).rejects.toThrow('500');
    await expect(promise).rejects.not.toBeInstanceOf(RawgRateLimitError);
  });
});
