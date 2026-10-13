import { normalizeText } from './gameFilters';

/**
 * Junta várias listas de opções em uma só, sem repetir (ignora acento e caixa)
 * e mantendo a ordem: as primeiras listas têm prioridade.
 */
export function mergeOptions(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const list of lists) {
    for (const value of list) {
      const trimmed = value.trim();
      const key = normalizeText(trimmed);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(trimmed);
    }
  }

  return result;
}
