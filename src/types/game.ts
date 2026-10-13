export const GAME_STATUSES = ['Quero jogar', 'Jogando', 'Zerado', 'Abandonado'] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];
export type StatusFilter = GameStatus | 'Todos';

export interface Game {
  id: string;
  name: string;
  coverUrl?: string;
  genre: string;
  platform: string;
  status: GameStatus;
  rating: number | null; // 1 a 5, ou null quando ainda não avaliado
  notes?: string;
  createdAt: string; // ISO date
}

export type GameInput = Omit<Game, 'id' | 'createdAt'>;

export interface RawgSearchResult {
  id: number;
  name: string;
  background_image: string | null;
  released?: string | null; // data de lançamento (AAAA-MM-DD)
  genres?: Array<{ name: string }> | null;
  platforms?: Array<{ platform: { name: string } }> | null;
}
