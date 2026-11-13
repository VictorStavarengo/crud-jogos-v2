import { describe, expect, it } from 'vitest';
import {
  autoStatusDates,
  datesForStatusChange,
  daysBetween,
  describeTimeline,
  formatISODate,
  isISODate,
  todayISODate,
} from './gameDates';
import type { Game } from '../types/game';

const TODAY = '2026-11-11';

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: '1',
    name: 'Celeste',
    genre: '',
    platform: '',
    status: 'Quero jogar',
    rating: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('todayISODate', () => {
  it('usa a data local, com zeros à esquerda', () => {
    expect(todayISODate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('isISODate', () => {
  it('aceita datas que existem', () => {
    expect(isISODate('2026-02-28')).toBe(true);
    expect(isISODate('2024-02-29')).toBe(true);
  });

  it('rejeita datas inexistentes, em outro formato ou de outro tipo', () => {
    for (const value of ['2026-02-30', '2025-02-29', '2026-13-01', '26-01-01', '2026/01/01', 'ontem', '', null, undefined, 20260101]) {
      expect(isISODate(value)).toBe(false);
    }
  });
});

describe('formatISODate', () => {
  it('mostra no formato brasileiro', () => {
    expect(formatISODate('2026-03-05')).toBe('05/03/2026');
  });
});

describe('daysBetween', () => {
  it('conta os dias corridos, inclusive entre meses e anos', () => {
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0);
    expect(daysBetween('2026-03-01', '2026-03-15')).toBe(14);
    expect(daysBetween('2025-12-30', '2026-01-02')).toBe(3);
    expect(daysBetween('2026-03-15', '2026-03-01')).toBe(-14);
  });
});

describe('datesForStatusChange', () => {
  it('passar a "Jogando" marca o início como hoje', () => {
    expect(datesForStatusChange('Quero jogar', 'Jogando', {}, TODAY)).toEqual({ startedAt: TODAY });
  });

  it('não troca um início que já estava registrado', () => {
    expect(datesForStatusChange('Quero jogar', 'Jogando', { startedAt: '2026-01-01' }, TODAY)).toEqual({
      startedAt: '2026-01-01',
    });
  });

  it('passar a "Zerado" marca o término como hoje e mantém o início', () => {
    expect(datesForStatusChange('Jogando', 'Zerado', { startedAt: '2026-01-01' }, TODAY)).toEqual({
      startedAt: '2026-01-01',
      finishedAt: TODAY,
    });
  });

  it('não muda nada quando o status continua o mesmo', () => {
    expect(datesForStatusChange('Zerado', 'Zerado', { finishedAt: '2026-02-02' }, TODAY)).toEqual({
      finishedAt: '2026-02-02',
    });
  });

  it('nunca apaga datas ao ir para outro status', () => {
    const dates = { startedAt: '2026-01-01', finishedAt: '2026-02-02' };

    expect(datesForStatusChange('Zerado', 'Abandonado', dates, TODAY)).toEqual(dates);
    expect(datesForStatusChange('Zerado', 'Quero jogar', dates, TODAY)).toEqual(dates);
  });
});

describe('autoStatusDates', () => {
  it('preenche as datas quando só o status muda (clique no card)', () => {
    expect(autoStatusDates(makeGame(), { status: 'Jogando' }, TODAY)).toMatchObject({ startedAt: TODAY });
  });

  it('não faz nada quando o status não está entre as mudanças', () => {
    expect(autoStatusDates(makeGame(), { rating: 3 }, TODAY)).toEqual({});
  });

  it('respeita uma edição completa, que já traz as datas (mesmo vazias)', () => {
    const edited = { status: 'Zerado' as const, startedAt: undefined, finishedAt: '2026-10-20' };

    expect(autoStatusDates(makeGame(), edited, TODAY)).toEqual({});
    expect(autoStatusDates(makeGame(), { status: 'Zerado', finishedAt: undefined }, TODAY)).toEqual({});
  });
});

describe('describeTimeline', () => {
  it('descreve início, término e duração de um jogo zerado', () => {
    const game = makeGame({ status: 'Zerado', startedAt: '2026-03-01', finishedAt: '2026-03-15' });

    expect(describeTimeline(game)).toBe('Começou em 01/03/2026 · Zerou em 15/03/2026 · 14 dias no total');
  });

  it('usa singular e trata o mesmo dia', () => {
    expect(describeTimeline(makeGame({ status: 'Zerado', startedAt: '2026-03-01', finishedAt: '2026-03-02' }))).toContain(
      '1 dia no total',
    );
    expect(describeTimeline(makeGame({ status: 'Zerado', startedAt: '2026-03-01', finishedAt: '2026-03-01' }))).toContain(
      'no mesmo dia',
    );
  });

  it('mostra só o início enquanto o jogo está em andamento', () => {
    expect(describeTimeline(makeGame({ status: 'Jogando', startedAt: '2026-03-01' }))).toBe('Começou em 01/03/2026');
  });

  it('ignora o término de um jogo que não está zerado', () => {
    expect(describeTimeline(makeGame({ status: 'Abandonado', finishedAt: '2026-03-15' }))).toBeNull();
  });

  it('devolve null quando não há datas', () => {
    expect(describeTimeline(makeGame())).toBeNull();
  });
});
