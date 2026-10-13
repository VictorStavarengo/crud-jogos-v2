import { describe, expect, it } from 'vitest';
import { mergeOptions } from './options';

describe('mergeOptions', () => {
  it('mantém a ordem e dá prioridade à primeira lista', () => {
    expect(mergeOptions(['PC', 'PlayStation 5'], ['Switch', 'pc'])).toEqual(['PC', 'PlayStation 5', 'Switch']);
  });

  it('ignora vazios, espaços e acentos repetidos', () => {
    expect(mergeOptions(['Ação', ' ', ''], ['acao', 'RPG'])).toEqual(['Ação', 'RPG']);
  });

  it('funciona sem listas', () => {
    expect(mergeOptions()).toEqual([]);
  });
});
