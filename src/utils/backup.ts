import type { Game } from '../types/game';
import { findDuplicate } from './gameDuplicates';
import { gamesCodec, STORAGE_VERSION } from './gamesStorage';

/** Limite de tamanho do arquivo de backup (uma biblioteca enorme ainda fica bem abaixo disso). */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

/** Conteúdo do arquivo de backup: o mesmo formato versionado que fica no localStorage. */
export function exportBackup(games: Game[], now: Date = new Date()): string {
  return JSON.stringify({ version: STORAGE_VERSION, exportedAt: now.toISOString(), games }, null, 2);
}

export function backupFileName(now: Date = new Date()): string {
  return `catalogo-de-jogos-${now.toISOString().slice(0, 10)}.json`;
}

/** Lê o texto de um backup. Devolve `null` se não for um backup válido deste app. */
export function parseBackup(text: string): Game[] | null {
  return gamesCodec.deserialize(text) ?? null;
}

export interface ImportResult {
  games: Game[];
  added: number;
  skipped: number;
}

/**
 * Soma os jogos do backup à biblioteca atual, sem apagar nada.
 * Pula o que já existe: mesmo id, ou mesmo nome na mesma plataforma.
 */
export function mergeGames(current: Game[], incoming: Game[]): ImportResult {
  const merged = [...current];
  const ids = new Set(current.map((game) => game.id));
  let added = 0;

  for (const game of incoming) {
    if (ids.has(game.id) || findDuplicate(merged, game)) continue;
    merged.push(game);
    ids.add(game.id);
    added += 1;
  }

  return { games: merged, added, skipped: incoming.length - added };
}

/** Frase para o aviso depois de importar. */
export function describeImport({ added, skipped }: Pick<ImportResult, 'added' | 'skipped'>): string {
  if (added === 0) {
    return skipped === 1
      ? 'Nada novo: o jogo do arquivo já está na sua biblioteca.'
      : `Nada novo: os ${skipped} jogos do arquivo já estão na sua biblioteca.`;
  }

  const importados = added === 1 ? '1 jogo importado' : `${added} jogos importados`;
  if (skipped === 0) return `${importados}.`;

  return skipped === 1
    ? `${importados}; 1 já existia e foi ignorado.`
    : `${importados}; ${skipped} já existiam e foram ignorados.`;
}
