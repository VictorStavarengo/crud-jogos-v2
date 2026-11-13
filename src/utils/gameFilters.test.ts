import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  filterGames,
  hasActiveFilters,
  normalizeText,
  uniqueValues,
  type GameFilters,
} from './gameFilters';
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
  makeGame({ name: 'Pokémon Ruby', status: 'Zerado', platform: 'Game Boy Advance', genre: 'RPG' }),
  makeGame({ name: 'Elden Ring', status: 'Jogando', platform: 'PC', genre: 'RPG' }),
  makeGame({ name: 'God of War', status: 'Jogando', platform: 'PlayStation', genre: 'Ação' }),
  makeGame({ name: 'Celeste', status: 'Quero jogar', platform: 'PC', genre: 'Plataforma' }),
];

const names = (list: Game[]) => list.map((g) => g.name);
const filters = (overrides: Partial<GameFilters>): GameFilters => ({ ...DEFAULT_FILTERS, ...overrides });

describe('normalizeText', () => {
  it('remove acentos, espaços nas pontas e diferença de caixa', () => {
    expect(normalizeText('  Pokémon  ')).toBe('pokemon');
    expect(normalizeText('AÇÃO')).toBe('acao');
  });
});

describe('filterGames', () => {
  it('sem filtros devolve todos os jogos', () => {
    expect(filterGames(games, DEFAULT_FILTERS)).toHaveLength(4);
  });

  it('encontra jogos ignorando acentos e maiúsculas', () => {
    expect(names(filterGames(games, filters({ search: 'pokemon' })))).toEqual(['Pokémon Ruby']);
    expect(filterGames(games, filters({ search: 'POKÉMON' }))).toHaveLength(1);
    expect(names(filterGames(games, filters({ search: 'elden' })))).toEqual(['Elden Ring']);
    expect(names(filterGames(games, filters({ search: 'god of' })))).toEqual(['God of War']);
  });

  it('busca vazia (ou só espaços) não filtra por nome', () => {
    expect(filterGames(games, filters({ search: '   ' }))).toHaveLength(4);
  });

  it('filtra por status', () => {
    expect(filterGames(games, filters({ status: 'Jogando' }))).toHaveLength(2);
    expect(filterGames(games, filters({ status: 'Abandonado' }))).toHaveLength(0);
  });

  it('filtra por plataforma e por gênero (ignorando acento e caixa)', () => {
    expect(names(filterGames(games, filters({ platform: 'pc' })))).toEqual(['Elden Ring', 'Celeste']);
    expect(names(filterGames(games, filters({ genre: 'acao' })))).toEqual(['God of War']);
  });

  it('combina todos os filtros', () => {
    const result = filterGames(games, filters({ search: 'e', status: 'Jogando', platform: 'PC', genre: 'RPG' }));

    expect(names(result)).toEqual(['Elden Ring']);
    expect(filterGames(games, filters({ search: 'celeste', status: 'Zerado' }))).toHaveLength(0);
  });
});

describe('hasActiveFilters', () => {
  it('é falso com os filtros padrão e com busca só de espaços', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters(filters({ search: '  ' }))).toBe(false);
  });

  it('é verdadeiro quando qualquer filtro está ligado', () => {
    expect(hasActiveFilters(filters({ search: 'a' }))).toBe(true);
    expect(hasActiveFilters(filters({ status: 'Zerado' }))).toBe(true);
    expect(hasActiveFilters(filters({ platform: 'PC' }))).toBe(true);
    expect(hasActiveFilters(filters({ genre: 'RPG' }))).toBe(true);
  });
});

describe('uniqueValues', () => {
  it('remove vazios e repetidos (ignorando caixa/acento) e ordena', () => {
    expect(uniqueValues(['PC', 'pc', ' ', 'Ação', 'acao', 'RPG', ''])).toEqual(['Ação', 'PC', 'RPG']);
  });
});
