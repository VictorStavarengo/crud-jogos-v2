import type { RawgSearchResult } from '../types/game';

const BASE_URL = 'https://api.rawg.io/api';

let warnedMissingKey = false;

// Lida em tempo de chamada (e não no carregamento do módulo) para ser fácil de testar.
function getApiKey(): string | undefined {
  return import.meta.env.VITE_RAWG_API_KEY || undefined;
}

/** Indica se a busca automática está disponível (chave da RAWG configurada). */
export function isRawgConfigured(): boolean {
  return Boolean(getApiKey());
}

interface RawgResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgSearchResult[];
}

/** A RAWG respondeu 429: o limite de requisições foi atingido. */
export class RawgRateLimitError extends Error {
  constructor() {
    super('Limite de requisições da RAWG atingido (429)');
    this.name = 'RawgRateLimitError';
  }
}

/**
 * Busca jogos por nome na RAWG.io para autocompletar o formulário.
 * Retorna uma lista vazia (em vez de lançar erro) quando a chave de API
 * não está configurada, para não quebrar a experiência local.
 * Aceita um AbortSignal para cancelar a requisição quando a busca muda.
 */
export async function searchGames(
  query: string,
  signal?: AbortSignal,
): Promise<RawgSearchResult[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.warn('VITE_RAWG_API_KEY não configurada — autocomplete desativado.');
    }
    return [];
  }

  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({ key: apiKey, search: trimmed, page_size: '5' });
  const response = await fetch(`${BASE_URL}/games?${params.toString()}`, { signal });

  if (response.status === 429) {
    throw new RawgRateLimitError();
  }

  if (!response.ok) {
    throw new Error(`Falha ao buscar jogos na RAWG.io: ${response.status}`);
  }

  const data = (await response.json()) as RawgResponse;
  return data.results ?? [];
}
