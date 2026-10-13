import type { GameStatus } from '../types/game';

/** Cor do pontinho de cada status (card e legenda usam a mesma fonte). */
export const STATUS_DOT: Record<GameStatus, string> = {
  'Quero jogar': 'bg-muted',
  Jogando: 'bg-status-playing',
  Zerado: 'bg-status-done',
  Abandonado: 'bg-status-dropped',
};