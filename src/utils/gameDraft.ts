import type { Game, GameInput, GameStatus, RawgSearchResult } from '../types/game';
import { mergeOptions } from './options';

/** Estado editável do formulário (etapa 2): tudo como string/number simples. */
export interface GameDraft {
  name: string;
  coverUrl?: string;
  genre: string;
  platform: string;
  status: GameStatus;
  rating: number | null;
  notes: string;
  /** Gêneros que a RAWG lista para o jogo (só sugestões; não vão para o jogo salvo). */
  genreOptions: string[];
  /** Plataformas que a RAWG lista para o jogo (só sugestões; não vão para o jogo salvo). */
  platformOptions: string[];
}

export function emptyDraft(name = ''): GameDraft {
  return {
    name,
    genre: '',
    platform: '',
    status: 'Quero jogar',
    rating: null,
    notes: '',
    genreOptions: [],
    platformOptions: [],
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
  };
}

/**
 * Cria o rascunho a partir do jogo escolhido na busca.
 * Com mais de uma opção de gênero ou plataforma o campo fica vazio: quem escolhe é a pessoa
 * (antes o app pegava a primeira da lista, que é arbitrária). Com uma só opção, já vem preenchido.
 */
export function draftFromSuggestion(suggestion: RawgSearchResult): GameDraft {
  const genreOptions = mergeOptions((suggestion.genres ?? []).map((genre) => genre?.name ?? ''));
  const platformOptions = mergeOptions(
    (suggestion.platforms ?? []).map((item) => item?.platform?.name ?? ''),
  );

  return {
    ...emptyDraft(suggestion.name),
    coverUrl: suggestion.background_image ?? undefined,
    genre: genreOptions.length === 1 ? genreOptions[0] : '',
    platform: platformOptions.length === 1 ? platformOptions[0] : '',
    genreOptions,
    platformOptions,
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
  };
}
