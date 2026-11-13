import { describe, expect, it } from 'vitest';
import { gamesCodec, STORAGE_VERSION } from './gamesStorage';
import type { Game } from '../types/game';

const game: Game = {
  id: '1',
  name: 'Celeste',
  genre: 'Plataforma',
  platform: 'Switch',
  status: 'Zerado',
  rating: 5,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('gamesCodec', () => {
  it('faz o ciclo completo de gravar e ler', () => {
    const raw = gamesCodec.serialize([game]);

    expect(JSON.parse(raw)).toMatchObject({ version: STORAGE_VERSION });
    expect(gamesCodec.deserialize(raw)).toEqual([expect.objectContaining({ id: '1', rating: 5 })]);
  });

  it('migra o formato antigo (array puro): nota 0 vira "sem nota"', () => {
    const legacy = JSON.stringify([{ ...game, rating: 0 }]);

    const result = gamesCodec.deserialize(legacy);

    expect(result).toHaveLength(1);
    expect(result?.[0].rating).toBeNull();
  });

  it('devolve undefined para JSON inválido ou formato desconhecido', () => {
    expect(gamesCodec.deserialize('isso não é json')).toBeUndefined();
    expect(gamesCodec.deserialize('{"foo":1}')).toBeUndefined();
    expect(gamesCodec.deserialize('"texto"')).toBeUndefined();
  });

  it('descarta itens inválidos e mantém os válidos', () => {
    const raw = JSON.stringify([game, { id: '2' }, null, { ...game, id: '3', status: 'Inventado' }]);

    expect(gamesCodec.deserialize(raw)).toHaveLength(1);
  });

  it('ignora campos desconhecidos', () => {
    const raw = JSON.stringify([{ ...game, campoInventado: 'x', outro: 123 }]);

    const result = gamesCodec.deserialize(raw);

    expect(result).toHaveLength(1);
    expect(result?.[0]).not.toHaveProperty('campoInventado');
    expect(result?.[0]).not.toHaveProperty('outro');
  });

  it('trata nota que não é número como "sem nota"', () => {
    const raw = JSON.stringify([{ ...game, rating: 'abc' }]);

    expect(gamesCodec.deserialize(raw)?.[0].rating).toBeNull();
  });

  it('descarta jogo com status inválido', () => {
    const raw = JSON.stringify([{ ...game, status: 'Em andamento' }]);

    expect(gamesCodec.deserialize(raw)).toEqual([]);
  });

  it('cria uma data válida quando o jogo salvo não tem createdAt', () => {
    const { createdAt, ...withoutDate } = game;
    void createdAt;

    const result = gamesCodec.deserialize(JSON.stringify([withoutDate]));

    expect(Number.isNaN(Date.parse(result?.[0].createdAt ?? ''))).toBe(false);
  });

  it('aceita capa http(s) e descarta endereços de outro tipo', () => {
    const raw = JSON.stringify([
      { ...game, id: '1', coverUrl: 'https://media.rawg.io/media/games/x.jpg' },
      { ...game, id: '2', coverUrl: 'javascript:alert(1)' },
      { ...game, id: '3', coverUrl: 'data:text/html,<b>oi</b>' },
    ]);

    const result = gamesCodec.deserialize(raw);

    expect(result?.map((g) => g.coverUrl)).toEqual(['https://media.rawg.io/media/games/x.jpg', undefined, undefined]);
  });

  it('limita notas fora do intervalo', () => {
    const raw = JSON.stringify([{ ...game, rating: 99 }, { ...game, id: '2', rating: -3 }]);

    const result = gamesCodec.deserialize(raw);

    expect(result?.map((g) => g.rating)).toEqual([5, null]);
  });
});
