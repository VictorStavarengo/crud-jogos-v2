import { describe, expect, it } from 'vitest';
import { draftFromGame, draftFromSuggestion, draftToInput, emptyDraft } from './gameDraft';
import type { Game, RawgSearchResult } from '../types/game';

const suggestion: RawgSearchResult = {
  id: 1,
  name: 'Elden Ring',
  background_image: 'https://media.rawg.io/media/games/x.jpg',
  genres: [{ name: 'Action' }, { name: 'RPG' }],
  platforms: [{ platform: { name: 'PC' } }, { platform: { name: 'PlayStation 5' } }],
};

describe('draftFromSuggestion', () => {
  it('lista todas as opções da RAWG sem escolher uma por conta própria', () => {
    const draft = draftFromSuggestion(suggestion);

    expect(draft.platformOptions).toEqual(['PC', 'PlayStation 5']);
    expect(draft.genreOptions).toEqual(['Action', 'RPG']);
    expect(draft.platform).toBe('');
    expect(draft.genre).toBe('');
    expect(draft.coverUrl).toBe('https://media.rawg.io/media/games/x.jpg');
  });

  it('já preenche o campo quando existe uma única opção', () => {
    const draft = draftFromSuggestion({
      ...suggestion,
      genres: [{ name: 'Puzzle' }],
      platforms: [{ platform: { name: 'Nintendo Switch' } }],
    });

    expect(draft.genre).toBe('Puzzle');
    expect(draft.platform).toBe('Nintendo Switch');
  });

  it('aguenta plataformas e gêneros ausentes (a API pode devolver null)', () => {
    const draft = draftFromSuggestion({ ...suggestion, genres: null, platforms: null, background_image: null });

    expect(draft.genreOptions).toEqual([]);
    expect(draft.platformOptions).toEqual([]);
    expect(draft.coverUrl).toBeUndefined();
  });

  it('remove opções repetidas', () => {
    const draft = draftFromSuggestion({
      ...suggestion,
      platforms: [{ platform: { name: 'PC' } }, { platform: { name: 'pc' } }],
    });

    expect(draft.platformOptions).toEqual(['PC']);
    expect(draft.platform).toBe('PC');
  });
});

describe('draftFromGame / draftToInput', () => {
  const game: Game = {
    id: '1',
    name: 'Celeste',
    genre: 'Plataforma',
    platform: 'Switch',
    status: 'Zerado',
    rating: 5,
    notes: 'Ótimo',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('ida e volta mantém os dados e não vaza as opções para o jogo salvo', () => {
    const draft = { ...draftFromGame(game), platformOptions: ['PC'], genreOptions: ['RPG'] };
    const input = draftToInput(draft);

    expect(input).toMatchObject({ name: 'Celeste', genre: 'Plataforma', platform: 'Switch', rating: 5, notes: 'Ótimo' });
    expect(input).not.toHaveProperty('platformOptions');
    expect(input).not.toHaveProperty('genreOptions');
  });

  it('emptyDraft começa sem nota, sem opções e como "Quero jogar"', () => {
    expect(emptyDraft('X')).toMatchObject({ name: 'X', status: 'Quero jogar', rating: null, platformOptions: [] });
  });
});
