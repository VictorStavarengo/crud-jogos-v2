import { describe, expect, it } from 'vitest';
import { mergeOptions, pickPreferred, rankByFrequency } from './options';

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

describe('rankByFrequency', () => {
  it('ordena do mais usado para o menos usado', () => {
    expect(rankByFrequency(['PC', 'Switch', 'PC', 'PlayStation', 'Switch', 'PC'])).toEqual([
      'PC',
      'Switch',
      'PlayStation',
    ]);
  });

  it('agrupa ignorando acento e caixa e mantém a primeira grafia', () => {
    expect(rankByFrequency(['Ação', 'acao', 'RPG', 'ACAO'])).toEqual(['Ação', 'RPG']);
  });

  it('desempata em ordem alfabética e ignora valores vazios', () => {
    expect(rankByFrequency(['Xbox', 'PC', '', '  ', 'Xbox', 'PC'])).toEqual(['PC', 'Xbox']);
  });

  it('devolve lista vazia sem valores', () => {
    expect(rankByFrequency([])).toEqual([]);
  });
});

describe('pickPreferred', () => {
  it('escolhe a primeira preferência que existe entre as opções', () => {
    expect(pickPreferred(['PlayStation 5', 'Xbox One', 'PC'], ['Switch', 'pc', 'Xbox One'])).toBe('pc');
  });

  it('devolve undefined quando nenhuma preferência está nas opções', () => {
    expect(pickPreferred(['PlayStation 5'], ['PC', 'Switch'])).toBeUndefined();
    expect(pickPreferred(['PC'], [])).toBeUndefined();
  });
});
