import { describe, expect, it } from 'vitest';
import { computeStats, countByStatus } from './gameStats';
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

describe('computeStats', () => {
  it('conta jogos por status e calcula a média só dos avaliados', () => {
    const stats = computeStats([
      makeGame({ status: 'Jogando', rating: 4 }),
      makeGame({ status: 'Zerado', rating: 5 }),
      makeGame({ status: 'Zerado', rating: null }),
    ]);

    expect(stats).toEqual({ total: 3, jogando: 1, zerado: 2, average: '4.5' });
  });

  it('média é null quando nenhum jogo tem nota', () => {
    expect(computeStats([makeGame({})]).average).toBeNull();
    expect(computeStats([]).average).toBeNull();
  });
});

describe('countByStatus', () => {
  it('conta cada status e inclui os que estão zerados', () => {
    const counts = countByStatus([
      makeGame({ status: 'Jogando' }),
      makeGame({ status: 'Jogando' }),
      makeGame({ status: 'Zerado' }),
    ]);

    expect(counts).toEqual({ 'Quero jogar': 0, Jogando: 2, Zerado: 1, Abandonado: 0 });
  });
});
