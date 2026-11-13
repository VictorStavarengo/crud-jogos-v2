import { describe, expect, it } from 'vitest';
import { draftFromGame, draftFromSuggestion, draftToInput, draftWithStatus, emptyDraft } from './gameDraft';
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

describe('draftFromSuggestion — preferências da biblioteca', () => {
  it('pré-seleciona a plataforma mais usada quando ela está entre as opções da RAWG', () => {
    const draft = draftFromSuggestion(suggestion, { platforms: ['Switch', 'PC'], genres: [] });

    expect(draft.platform).toBe('PC'); // "Switch" não está nas opções; "PC" é a próxima mais usada
    expect(draft.suggested.platform).toBe(true);
  });

  it('pré-seleciona o gênero mais usado, ignorando acento e caixa', () => {
    const draft = draftFromSuggestion(suggestion, { genres: ['rpg'] });

    expect(draft.genre).toBe('rpg');
    expect(draft.suggested.genre).toBe(true);
  });

  it('deixa o campo vazio quando nenhuma preferência combina com as opções', () => {
    const draft = draftFromSuggestion(suggestion, { platforms: ['Switch'], genres: ['Puzzle'] });

    expect(draft.platform).toBe('');
    expect(draft.genre).toBe('');
    expect(draft.suggested).toEqual({ platform: false, genre: false });
  });

  it('com uma única opção preenche, mas não conta como "sugerido"', () => {
    const draft = draftFromSuggestion(
      { ...suggestion, platforms: [{ platform: { name: 'PC' } }] },
      { platforms: ['PC'] },
    );

    expect(draft.platform).toBe('PC');
    expect(draft.suggested.platform).toBe(false);
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
    expect(input).not.toHaveProperty('suggested');
  });

  it('emptyDraft começa sem nota, sem opções e como "Quero jogar"', () => {
    expect(emptyDraft('X')).toMatchObject({ name: 'X', status: 'Quero jogar', rating: null, platformOptions: [] });
  });
});

describe('datas no rascunho', () => {
  const finished: Game = {
    id: '1',
    name: 'Celeste',
    genre: 'Plataforma',
    platform: 'Switch',
    status: 'Zerado',
    rating: 5,
    startedAt: '2026-03-01',
    finishedAt: '2026-03-15',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('começa sem datas', () => {
    expect(emptyDraft('X')).toMatchObject({ startedAt: '', finishedAt: '' });
  });

  it('ida e volta entre jogo e rascunho preserva as datas', () => {
    const input = draftToInput(draftFromGame(finished));

    expect(input).toMatchObject({ startedAt: '2026-03-01', finishedAt: '2026-03-15' });
  });

  it('data vazia vira undefined, mas a chave continua presente (a edição completa depende disso)', () => {
    const input = draftToInput(emptyDraft('X'));

    expect(input.startedAt).toBeUndefined();
    expect(input).toHaveProperty('startedAt');
    expect(input).toHaveProperty('finishedAt');
  });

  it('draftWithStatus preenche as datas conforme o status e não apaga nada', () => {
    const playing = draftWithStatus(emptyDraft('X'), 'Jogando', '2026-11-11');
    expect(playing).toMatchObject({ status: 'Jogando', startedAt: '2026-11-11', finishedAt: '' });

    const done = draftWithStatus(playing, 'Zerado', '2026-11-20');
    expect(done).toMatchObject({ status: 'Zerado', startedAt: '2026-11-11', finishedAt: '2026-11-20' });

    const dropped = draftWithStatus(done, 'Abandonado', '2026-12-01');
    expect(dropped).toMatchObject({ startedAt: '2026-11-11', finishedAt: '2026-11-20' });
  });
});
