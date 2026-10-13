import type { Game, GameInput } from '../types/game';
import { normalizeText } from './gameFilters';

/**
 * Procura um jogo igual (mesmo nome e mesma plataforma, ignorando acento e caixa).
 * A plataforma conta porque o mesmo jogo pode estar na biblioteca em plataformas diferentes.
 * `ignoreId` serve para a edição não considerar o próprio jogo como duplicado.
 */
export function findDuplicate(
  games: Game[],
  candidate: Pick<GameInput, 'name' | 'platform'>,
  ignoreId?: string,
): Game | undefined {
  const name = normalizeText(candidate.name);
  const platform = normalizeText(candidate.platform);

  return games.find(
    (game) =>
      game.id !== ignoreId &&
      normalizeText(game.name) === name &&
      normalizeText(game.platform) === platform,
  );
}
