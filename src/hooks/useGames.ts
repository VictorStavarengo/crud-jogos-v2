import { useCallback } from 'react';
import type { Game, GameInput } from '../types/game';
import { GAMES_STORAGE_KEY } from '../constants/storageKeys';
import { gamesCodec } from '../utils/gamesStorage';
import { mergeGames } from '../utils/backup';
import { moveItem } from '../utils/moveItem';
import { useLocalStorage } from './useLocalStorage';

export function useGames() {
  const [games, setGames, storageOk] = useLocalStorage<Game[]>(GAMES_STORAGE_KEY, [], gamesCodec);

  const addGame = useCallback(
    (input: GameInput) => {
      const newGame: Game = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setGames((current) => [newGame, ...current]);
      return newGame;
    },
    [setGames],
  );

  const updateGame = useCallback(
    (id: string, changes: Partial<GameInput>) => {
      setGames((current) =>
        current.map((game) => (game.id === id ? { ...game, ...changes } : game)),
      );
    },
    [setGames],
  );

  const removeGame = useCallback(
    (id: string) => {
      setGames((current) => current.filter((game) => game.id !== id));
    },
    [setGames],
  );

  /** Devolve um jogo removido (desfazer), na posição em que estava. */
  const restoreGame = useCallback(
    (game: Game, index: number) => {
      setGames((current) => {
        if (current.some((item) => item.id === game.id)) return current;
        const next = [...current];
        next.splice(Math.min(index, next.length), 0, game);
        return next;
      });
    },
    [setGames],
  );

  /** Reordena a lista: o jogo `activeId` assume a posição do jogo `overId`. */
  const reorderGames = useCallback(
    (activeId: string, overId: string) => {
      setGames((current) =>
        moveItem(
          current,
          current.findIndex((game) => game.id === activeId),
          current.findIndex((game) => game.id === overId),
        ),
      );
    },
    [setGames],
  );

  /** Soma jogos de um backup à biblioteca (pula os que já existem). Devolve quantos entraram. */
  const importGames = useCallback(
    (incoming: Game[]) => {
      const { games: merged, added, skipped } = mergeGames(games, incoming);
      if (added > 0) setGames(merged);
      return { added, skipped };
    },
    [games, setGames],
  );

  return { games, addGame, updateGame, removeGame, restoreGame, reorderGames, importGames, storageOk };
}
