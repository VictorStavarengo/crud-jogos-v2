import type { Game, GameInput, GameStatus, RawgSearchResult } from '../types/game';
import { datesForStatusChange, todayISODate } from './gameDates';
import { mergeOptions, pickPreferred } from './options';

/** Estado editável do formulário (etapa 2): tudo como string/number simples. */
export interface GameDraft {
  name: string;
  coverUrl?: string;
  genre: string;
  platform: string;
  status: GameStatus;
  rating: number | null;
  notes: string;
  /** Data de início (AAAA-MM-DD); vazio = sem data. */
  startedAt: string;
  /** Data de término (AAAA-MM-DD); vazio = sem data. */
  finishedAt: string;
  /** Gêneros que a RAWG lista para o jogo (só sugestões; não vão para o jogo salvo). */
  genreOptions: string[];
  /** Plataformas que a RAWG lista para o jogo (só sugestões; não vão para o jogo salvo). */
  platformOptions: string[];
  /** Campos que o app preencheu sozinho com base no que a pessoa mais usa (para avisar na tela). */
  suggested: { platform: boolean; genre: boolean };
}

/** Valores já usados na biblioteca, do mais para o menos usado. */
export interface DraftPreferences {
  platforms?: string[];
  genres?: string[];
}

export function emptyDraft(name = ''): GameDraft {
  return {
    name,
    genre: '',
    platform: '',
    status: 'Quero jogar',
    rating: null,
    notes: '',
    startedAt: '',
    finishedAt: '',
    genreOptions: [],
    platformOptions: [],
    suggested: { platform: false, genre: false },
  };
}

export function draftFromGame(game: Game): GameDraft {
  return {
    ...emptyDraft(game.name),
    coverUrl: game.coverUrl,
    genre: game.genre,
    platform: game.platform,
    status: game.status,
    rating: game.rating,
    notes: game.notes ?? '',
    startedAt: game.startedAt ?? '',
    finishedAt: game.finishedAt ?? '',
  };
}

/**
 * Escolhe o valor inicial de um campo (plataforma ou gênero) entre as opções da RAWG:
 *  - uma única opção: já vem preenchida;
 *  - várias: usa a que a pessoa mais usa na biblioteca (e que exista entre as opções);
 *  - se nenhuma combinar, o campo fica vazio e quem escolhe é a pessoa
 *    (pegar a primeira da lista seria arbitrário).
 */
function initialChoice(options: string[], preferred: string[]): { value: string; suggested: boolean } {
  if (options.length === 1) return { value: options[0], suggested: false };

  const value = pickPreferred(options, preferred);
  return { value: value ?? '', suggested: value !== undefined };
}

/** Cria o rascunho a partir do jogo escolhido na busca. */
export function draftFromSuggestion(
  suggestion: RawgSearchResult,
  preferences: DraftPreferences = {},
): GameDraft {
  const genreOptions = mergeOptions((suggestion.genres ?? []).map((genre) => genre?.name ?? ''));
  const platformOptions = mergeOptions(
    (suggestion.platforms ?? []).map((item) => item?.platform?.name ?? ''),
  );
  const genre = initialChoice(genreOptions, preferences.genres ?? []);
  const platform = initialChoice(platformOptions, preferences.platforms ?? []);

  return {
    ...emptyDraft(suggestion.name),
    coverUrl: suggestion.background_image ?? undefined,
    genre: genre.value,
    platform: platform.value,
    genreOptions,
    platformOptions,
    suggested: { platform: platform.suggested, genre: genre.suggested },
  };
}

export function draftToInput(draft: GameDraft): GameInput {
  return {
    name: draft.name.trim(),
    coverUrl: draft.coverUrl,
    genre: draft.genre.trim(),
    platform: draft.platform.trim(),
    status: draft.status,
    rating: draft.rating,
    notes: draft.notes.trim() || undefined,
    startedAt: draft.startedAt || undefined,
    finishedAt: draft.finishedAt || undefined,
  };
}

/**
 * Troca o status do rascunho e preenche as datas (início ao passar a "Jogando", término ao passar
 * a "Zerado"). As datas continuam editáveis: a pessoa pode corrigir antes de salvar.
 */
export function draftWithStatus(
  draft: GameDraft,
  status: GameStatus,
  today: string = todayISODate(),
): GameDraft {
  const dates = datesForStatusChange(
    draft.status,
    status,
    { startedAt: draft.startedAt || undefined, finishedAt: draft.finishedAt || undefined },
    today,
  );

  return { ...draft, status, startedAt: dates.startedAt ?? '', finishedAt: dates.finishedAt ?? '' };
}
