import { GAME_STATUSES, type GameStatus } from '../types/game';

/** Próximo status na ordem de GAME_STATUSES (volta ao primeiro depois do último). */
export function nextStatus(status: GameStatus): GameStatus {
  const index = GAME_STATUSES.indexOf(status);
  return GAME_STATUSES[(index + 1) % GAME_STATUSES.length];
}
