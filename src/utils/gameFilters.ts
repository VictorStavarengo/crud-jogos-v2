import type { Game, StatusFilter } from '../types/game';

export interface GameFilters {
  search: string;
  status: StatusFilter;
  /** Texto vazio = todas as plataformas. */
  platform: string;
  /** Texto vazio = todos os gêneros. */
  genre: string;
}

export const DEFAULT_FILTERS: GameFilters = {
  search: '',
  status: 'Todos',
  platform: '',
  genre: '',
};

/** Minúsculas, sem acentos e sem espaços nas pontas: "Pokémon " → "pokemon". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterGames(games: Game[], filters: GameFilters): Game[] {
  const term = normalizeText(filters.search);
  const platform = normalizeText(filters.platform);
  const genre = normalizeText(filters.genre);

  return games.filter((game) => {
    if (term && !normalizeText(game.name).includes(term)) return false;
    if (filters.status !== 'Todos' && game.status !== filters.status) return false;
    if (platform && normalizeText(game.platform) !== platform) return false;
    if (genre && normalizeText(game.genre) !== genre) return false;
    return true;
  });
}

export function hasActiveFilters(filters: GameFilters): boolean {
  return (
    Boolean(normalizeText(filters.search)) ||
    filters.status !== 'Todos' ||
    Boolean(filters.platform) ||
    Boolean(filters.genre)
  );
}

/** Valores distintos (ignorando acento e caixa), em ordem alfabética: alimenta os menus de filtro. */
export function uniqueValues(values: string[]): string[] {
  const seen = new Map<string, string>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalizeText(trimmed);
    if (!seen.has(key)) seen.set(key, trimmed);
  }

  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
}
