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

/**
 * Valores distintos do mais usado para o menos usado (ignora acento e caixa).
 * Em caso de empate, vale a ordem alfabética.
 */
export function rankByFrequency(values: string[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const value of values) {
    const label = value.trim();
    const key = normalizeText(label);
    if (!key) continue;

    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { label, count: 1 });
  }

  return [...counts.values()]
    .sort(
      (a, b) =>
        b.count - a.count || a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }),
    )
    .map((entry) => entry.label);
}

/** Primeiro valor da lista de preferências que também existe entre as opções. */
export function pickPreferred(options: string[], preferred: string[]): string | undefined {
  const available = new Set(options.map(normalizeText));
  return preferred.find((value) => available.has(normalizeText(value)));
}
