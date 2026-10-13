import { GAME_STATUSES, type Game, type GameStatus } from '../types/game';

export interface GameStats {
  total: number;
  jogando: number;
  zerado: number;
  /** Média só dos jogos com nota; `null` se nenhum foi avaliado. */
  average: string | null;
}

export function computeStats(games: Game[]): GameStats {
  const ratings = games.flatMap((game) => (game.rating === null ? [] : [game.rating]));
  const average = ratings.length
    ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
    : null;

  return {
    total: games.length,
    jogando: games.filter((game) => game.status === 'Jogando').length,
    zerado: games.filter((game) => game.status === 'Zerado').length,
    average,
  };
}

/** Quantidade de jogos em cada status (todos os status aparecem, mesmo com 0). */
export function countByStatus(games: Game[]): Record<GameStatus, number> {
  const counts = Object.fromEntries(GAME_STATUSES.map((status) => [status, 0])) as Record<
    GameStatus,
    number
  >;

  for (const game of games) {
    counts[game.status] += 1;
  }

  return counts;
}
