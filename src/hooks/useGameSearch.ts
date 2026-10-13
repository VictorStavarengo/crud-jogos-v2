import { useEffect, useState } from 'react';
import type { RawgSearchResult } from '../types/game';
import { isRawgConfigured, RawgRateLimitError, searchGames } from '../services/rawgApi';
import { useDebouncedValue } from './useDebouncedValue';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error' | 'limited';

interface FinishedSearch {
  forQuery: string;
  results: RawgSearchResult[];
  status: 'success' | 'error' | 'limited';
}

export interface GameSearchState {
  results: RawgSearchResult[];
  status: SearchStatus;
}

/**
 * Busca jogos na RAWG enquanto a pessoa digita (com debounce).
 * O status é derivado: "loading" cobre tanto a espera do debounce quanto a
 * requisição em andamento, então a tela nunca mostra "nenhum resultado" cedo demais.
 */
export function useGameSearch(query: string, delayMs = 400): GameSearchState {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, delayMs);
  const [finished, setFinished] = useState<FinishedSearch | null>(null);

  useEffect(() => {
    if (!debounced || !isRawgConfigured()) return;

    const controller = new AbortController();

    searchGames(debounced, controller.signal)
      .then((results) => {
        if (controller.signal.aborted) return;
        setFinished({ forQuery: debounced, results, status: 'success' });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const status = error instanceof RawgRateLimitError ? 'limited' : 'error';
        setFinished({ forQuery: debounced, results: [], status });
      });

    return () => controller.abort();
  }, [debounced]);

  if (!trimmed || !isRawgConfigured()) return { results: [], status: 'idle' };

  // Ainda não temos resposta para o que está digitado agora.
  if (!finished || finished.forQuery !== trimmed) {
    return { results: finished?.results ?? [], status: 'loading' };
  }

  return { results: finished.results, status: finished.status };
}
