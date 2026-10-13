import type { Game } from '../types/game';

/** `manual` mantém a ordem que a pessoa montou arrastando os cards. */
export type GameSort = 'manual' | 'recent' | 'name' | 'rating';

export const GAME_SORT_OPTIONS: Array<{ value: GameSort; label: string }> = [
  { value: 'manual', label: 'Minha ordem' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'name', label: 'Nome (A–Z)' },
  { value: 'rating', label: 'Maior nota' },
];

function compareNames(a: Game, b: Game): number {
  return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
}

export function sortGames(games: Game[], sort: GameSort): Game[] {
  switch (sort) {
    case 'recent':
      // createdAt é ISO 8601, então a comparação de texto já ordena por data
      return [...games].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'name':
      return [...games].sort(compareNames);
    case 'rating':
      // Maior nota primeiro; sem nota por último; empate desempata pelo nome
      return [...games].sort((a, b) => {
        if (a.rating === b.rating) return compareNames(a, b);
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });
    default:
      return games;
  }
}
