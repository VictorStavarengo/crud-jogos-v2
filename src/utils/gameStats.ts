import { GAME_STATUSES, type Game, type GameStatus } from '../types/game';
import { daysBetween } from './gameDates';

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

export interface PlayStats {
  /** Ano usado na contagem (o do dia em que o cálculo foi feito). */
  year: number;
  /** Jogos zerados nesse ano, pela data de término. */
  finishedThisYear: number;
  /** Média de dias entre começar e zerar (só jogos com as duas datas); `null` sem dados. */
  averageDays: number | null;
}

/** Estatísticas que dependem das datas de início e término registradas nos jogos. */
export function computePlayStats(games: Game[], now: Date = new Date()): PlayStats {
  const year = now.getFullYear();

  const finished = games.flatMap((game) =>
    game.status === 'Zerado' && game.finishedAt ? [{ start: game.startedAt, end: game.finishedAt }] : [],
  );
  const finishedThisYear = finished.filter(({ end }) => end.startsWith(`${year}-`)).length;

  // Término anterior ao início é um erro de digitação: não entra na média
  const durations = finished.flatMap(({ start, end }) => {
    if (!start) return [];
    const days = daysBetween(start, end);
    return days >= 0 ? [days] : [];
  });
  const averageDays = durations.length
    ? Math.round(durations.reduce((sum, days) => sum + days, 0) / durations.length)
    : null;

  return { year, finishedThisYear, averageDays };
}
