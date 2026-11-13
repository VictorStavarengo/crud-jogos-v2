import { describe, expect, it } from 'vitest';
import { computePlayStats, computeStats, countByStatus } from './gameStats';
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

describe('computePlayStats', () => {
  const now = new Date(2026, 10, 11);

  it('conta os zerados no ano e a média de dias entre começar e zerar', () => {
    const stats = computePlayStats(
      [
        makeGame({ status: 'Zerado', startedAt: '2026-01-01', finishedAt: '2026-01-11' }), // 10 dias
        makeGame({ status: 'Zerado', startedAt: '2026-03-01', finishedAt: '2026-03-21' }), // 20 dias
        makeGame({ status: 'Zerado', finishedAt: '2025-12-31' }), // outro ano e sem início
        makeGame({ status: 'Jogando', startedAt: '2026-05-01' }),
        makeGame({ status: 'Abandonado', finishedAt: '2026-06-01' }), // não está zerado
      ],
      now,
    );

    expect(stats).toEqual({ year: 2026, finishedThisYear: 2, averageDays: 15 });
  });

  it('sem datas: nenhum zerado no ano e média null', () => {
    expect(computePlayStats([makeGame({ status: 'Zerado' })], now)).toEqual({
      year: 2026,
      finishedThisYear: 0,
      averageDays: null,
    });
    expect(computePlayStats([], now).averageDays).toBeNull();
  });

  it('ignora da média um término anterior ao início (erro de digitação)', () => {
    const stats = computePlayStats(
      [makeGame({ status: 'Zerado', startedAt: '2026-02-10', finishedAt: '2026-02-01' })],
      now,
    );

    expect(stats).toEqual({ year: 2026, finishedThisYear: 1, averageDays: null });
  });
});
