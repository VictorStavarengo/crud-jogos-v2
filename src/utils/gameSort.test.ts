import { describe, expect, it } from 'vitest';
import { sortGames } from './gameSort';
import type { Game } from '../types/game';

function makeGame(overrides: Partial<Game>): Game {
  return {
    id: crypto.randomUUID(),
    name: 'Jogo',
    genre: '',
    platform: '',
    status: 'Quero jogar',
    rating: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const games = [
  makeGame({ name: 'Zelda', rating: 5, createdAt: '2026-01-02T00:00:00.000Z' }),
  makeGame({ name: 'Árvore', rating: null, createdAt: '2026-03-01T00:00:00.000Z' }),
  makeGame({ name: 'Celeste', rating: 5, createdAt: '2026-02-01T00:00:00.000Z' }),
  makeGame({ name: 'Hades', rating: 3, createdAt: '2026-01-01T00:00:00.000Z' }),
];

const names = (list: Game[]) => list.map((g) => g.name);

describe('sortGames', () => {
  it('manual mantém a ordem recebida (mesma lista)', () => {
    expect(sortGames(games, 'manual')).toBe(games);
  });

  it('recent: mais novos primeiro', () => {
    expect(names(sortGames(games, 'recent'))).toEqual(['Árvore', 'Celeste', 'Zelda', 'Hades']);
  });

  it('name: ordem alfabética em português (acentos não atrapalham)', () => {
    expect(names(sortGames(games, 'name'))).toEqual(['Árvore', 'Celeste', 'Hades', 'Zelda']);
  });

  it('rating: maior nota primeiro, sem nota por último, empate pelo nome', () => {
    expect(names(sortGames(games, 'rating'))).toEqual(['Celeste', 'Zelda', 'Hades', 'Árvore']);
  });

  it('não altera a lista original', () => {
    const before = names(games);
    sortGames(games, 'name');
    expect(names(games)).toEqual(before);
  });
});
