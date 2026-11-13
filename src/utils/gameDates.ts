import type { Game, GameInput, GameStatus } from '../types/game';

/** Datas de um jogo, no formato AAAA-MM-DD (o mesmo valor de um <input type="date">). */
export interface GameDates {
  startedAt?: string;
  finishedAt?: string;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

/** `true` para uma data AAAA-MM-DD que existe de verdade (rejeita, por exemplo, 2026-02-30). */
export function isISODate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Data de hoje no fuso do usuário, como AAAA-MM-DD. */
export function todayISODate(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** AAAA-MM-DD → DD/MM/AAAA (sem passar por `Date`, para o fuso não mudar o dia). */
export function formatISODate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

function toUTC(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Dias corridos entre duas datas AAAA-MM-DD (negativo se `end` for anterior a `start`). */
export function daysBetween(start: string, end: string): number {
  return Math.round((toUTC(end) - toUTC(start)) / DAY_MS);
}

/**
 * Preenche as datas quando o status muda:
 *  - passar a "Jogando" marca o início como hoje (se ainda não havia início);
 *  - passar a "Zerado" marca o término como hoje.
 * Nunca apaga uma data: clicar sem querer num status não faz a pessoa perder o que registrou.
 */
export function datesForStatusChange(
  from: GameStatus | null,
  to: GameStatus,
  dates: GameDates,
  today: string,
): GameDates {
  if (from === to) return dates;

  const next = { ...dates };
  if (to === 'Jogando' && !next.startedAt) next.startedAt = today;
  if (to === 'Zerado') next.finishedAt = today;
  return next;
}

/**
 * Datas automáticas para uma atualização parcial que muda o status (como o clique no
 * status do card). Uma edição completa pelo formulário já traz as datas, que a pessoa
 * pode ter ajustado: nesse caso nada é alterado aqui.
 */
export function autoStatusDates(game: Game, changes: Partial<GameInput>, today: string): GameDates {
  if (changes.status === undefined) return {};
  if ('startedAt' in changes || 'finishedAt' in changes) return {};

  return datesForStatusChange(
    game.status,
    changes.status,
    { startedAt: game.startedAt, finishedAt: game.finishedAt },
    today,
  );
}

/** Frase com início, término e duração para o modal de detalhes (`null` quando não há datas). */
export function describeTimeline(game: Pick<Game, 'status' | 'startedAt' | 'finishedAt'>): string | null {
  const parts: string[] = [];

  if (game.startedAt) parts.push(`Começou em ${formatISODate(game.startedAt)}`);

  if (game.status === 'Zerado' && game.finishedAt) {
    parts.push(`Zerou em ${formatISODate(game.finishedAt)}`);

    if (game.startedAt) {
      const days = daysBetween(game.startedAt, game.finishedAt);
      if (days === 0) parts.push('no mesmo dia');
      else if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'} no total`);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}
