import { GAME_STATUSES, type Game, type GameStatus } from '../types/game';
import type { StorageCodec } from '../hooks/useLocalStorage';
import { isISODate } from './gameDates';

/**
 * Versões do formato salvo:
 *  - v1 (antigo): array puro de jogos, com nota 0 significando "sem nota";
 *  - v2: { version: 2, games: [...] }, com nota `null` para "sem nota".
 * Campos opcionais novos (como as datas de início e término) não exigem outra versão:
 * jogos salvos sem eles continuam válidos.
 */
export const STORAGE_VERSION = 2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is GameStatus {
  return typeof value === 'string' && (GAME_STATUSES as readonly string[]).includes(value);
}

/** Nota válida é de 1 a 5; qualquer outra coisa (inclusive o 0 antigo) vira "sem nota". */
function normalizeRating(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  const rounded = Math.round(value);
  return rounded < 1 ? null : Math.min(5, rounded);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

/** Só aceita endereço http(s): um backup importado não pode carregar nada além de imagens comuns. */
function imageUrl(value: unknown): string | undefined {
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined;
}

/** Data AAAA-MM-DD que existe de verdade; qualquer outra coisa vira "sem data". */
function optionalDate(value: unknown): string | undefined {
  return isISODate(value) ? value : undefined;
}

/** Valida e normaliza um item salvo. Itens inválidos são descartados (devolve null). */
function toGame(item: unknown): Game | null {
  if (!isRecord(item)) return null;
  if (typeof item.id !== 'string' || !item.id) return null;
  if (typeof item.name !== 'string' || !item.name.trim()) return null;
  if (!isStatus(item.status)) return null;

  return {
    id: item.id,
    name: item.name,
    coverUrl: imageUrl(item.coverUrl),
    genre: typeof item.genre === 'string' ? item.genre : '',
    platform: typeof item.platform === 'string' ? item.platform : '',
    status: item.status,
    rating: normalizeRating(item.rating),
    notes: optionalString(item.notes),
    startedAt: optionalDate(item.startedAt),
    finishedAt: optionalDate(item.finishedAt),
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
  };
}

export interface ParsedGames {
  games: Game[];
  /** Quantos itens do texto foram descartados por estarem inválidos. */
  invalid: number;
}

/** Lê o texto salvo e informa também quantos itens foram descartados. `undefined` = formato desconhecido. */
export function parseGames(raw: string): ParsedGames | undefined {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return undefined;
  }

  let list: unknown[];
  if (Array.isArray(json)) {
    list = json; // v1
  } else if (isRecord(json) && json.version === STORAGE_VERSION && Array.isArray(json.games)) {
    list = json.games;
  } else {
    return undefined;
  }

  const games = list.flatMap((item) => {
    const game = toGame(item);
    return game ? [game] : [];
  });

  return { games, invalid: list.length - games.length };
}

function deserialize(raw: string): Game[] | undefined {
  return parseGames(raw)?.games;
}

function serialize(games: Game[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, games });
}

export const gamesCodec: StorageCodec<Game[]> = { deserialize, serialize };
