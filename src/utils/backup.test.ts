import { describe, expect, it } from 'vitest';
import {
  backupFileName,
  describeImport,
  exportBackup,
  mergeGames,
  parseBackup,
  parseBackupDetailed,
} from './backup';
import type { Game } from '../types/game';

function makeGame(overrides: Partial<Game>): Game {
  return {
    id: crypto.randomUUID(),
    name: 'Jogo',
    genre: 'RPG',
    platform: 'PC',
    status: 'Jogando',
    rating: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const celeste = makeGame({ id: '1', name: 'Celeste', platform: 'Switch', rating: 5, notes: 'Ótimo' });
const hades = makeGame({ id: '2', name: 'Hades' });

describe('exportBackup / parseBackup', () => {
  it('o backup exportado pode ser lido de volta sem perder nada', () => {
    const text = exportBackup([celeste, hades]);

    expect(parseBackup(text)).toEqual([celeste, hades]);
  });

  it('o arquivo é versionado e legível (indentado)', () => {
    const text = exportBackup([celeste], new Date('2026-10-03T10:00:00Z'));
    const json = JSON.parse(text);

    expect(json.version).toBe(2);
    expect(json.exportedAt).toBe('2026-10-03T10:00:00.000Z');
    expect(text).toContain('\n  ');
  });

  it('aceita o formato antigo (lista simples)', () => {
    expect(parseBackup(JSON.stringify([celeste]))).toHaveLength(1);
  });

  it('devolve null para arquivos que não são um backup', () => {
    expect(parseBackup('isso não é json')).toBeNull();
    expect(parseBackup('{"version": 99, "games": []}')).toBeNull();
    expect(parseBackup('{"outra": "coisa"}')).toBeNull();
  });
});

describe('parseBackupDetailed', () => {
  it('conta os itens inválidos que foram descartados', () => {
    const text = JSON.stringify({
      version: 2,
      games: [celeste, { id: '2' }, null, { ...hades, status: 'Inventado' }],
    });

    const result = parseBackupDetailed(text);

    expect(result?.games).toHaveLength(1);
    expect(result?.invalid).toBe(3);
  });

  it('informa zero inválidos quando está tudo certo', () => {
    const result = parseBackupDetailed(exportBackup([celeste, hades]));

    expect(result?.games).toHaveLength(2);
    expect(result?.invalid).toBe(0);
  });

  it('também conta os inválidos no formato antigo (lista simples)', () => {
    const result = parseBackupDetailed(JSON.stringify([celeste, { id: 'sem-nome' }]));

    expect(result?.games).toHaveLength(1);
    expect(result?.invalid).toBe(1);
  });

  it('devolve null para arquivos que não são um backup', () => {
    expect(parseBackupDetailed('isso não é json')).toBeNull();
    expect(parseBackupDetailed('{"version": 99, "games": []}')).toBeNull();
    expect(parseBackupDetailed('{"outra": "coisa"}')).toBeNull();
  });
});

describe('backupFileName', () => {
  it('usa a data no nome do arquivo', () => {
    expect(backupFileName(new Date('2026-10-03T10:00:00Z'))).toBe('catalogo-de-jogos-2026-10-03.json');
  });
});

describe('mergeGames', () => {
  it('soma os jogos novos ao final, sem mexer nos que já existem', () => {
    const result = mergeGames([celeste], [hades]);

    expect(result.games.map((g) => g.name)).toEqual(['Celeste', 'Hades']);
    expect(result).toMatchObject({ added: 1, skipped: 0 });
  });

  it('pula o que tem o mesmo id', () => {
    const result = mergeGames([celeste], [{ ...celeste, name: 'Outro nome' }]);

    expect(result.games).toHaveLength(1);
    expect(result).toMatchObject({ added: 0, skipped: 1 });
  });

  it('pula o mesmo jogo na mesma plataforma, mas aceita em outra', () => {
    const samePlatform = makeGame({ id: '10', name: 'CELESTE', platform: 'switch' });
    const otherPlatform = makeGame({ id: '11', name: 'Celeste', platform: 'PC' });

    const result = mergeGames([celeste], [samePlatform, otherPlatform]);

    expect(result.games.map((g) => g.id)).toEqual(['1', '11']);
    expect(result).toMatchObject({ added: 1, skipped: 1 });
  });

  it('também evita repetidos dentro do próprio arquivo', () => {
    const result = mergeGames([], [hades, { ...hades, id: '99' }]);

    expect(result).toMatchObject({ added: 1, skipped: 1 });
  });

  it('não altera a lista original', () => {
    const current = [celeste];
    mergeGames(current, [hades]);

    expect(current).toHaveLength(1);
  });
});

describe('describeImport', () => {
  it('descreve cada situação', () => {
    expect(describeImport({ added: 1, skipped: 0 })).toBe('1 jogo importado.');
    expect(describeImport({ added: 3, skipped: 0 })).toBe('3 jogos importados.');
    expect(describeImport({ added: 2, skipped: 1 })).toBe('2 jogos importados; 1 já existia e foi ignorado.');
    expect(describeImport({ added: 1, skipped: 4 })).toBe('1 jogo importado; 4 já existiam e foram ignorados.');
    expect(describeImport({ added: 0, skipped: 1 })).toBe('Nada novo: o jogo do arquivo já está na sua biblioteca.');
    expect(describeImport({ added: 0, skipped: 5 })).toBe('Nada novo: os 5 jogos do arquivo já estão na sua biblioteca.');
  });

  it('não muda a frase quando não há itens inválidos', () => {
    expect(describeImport({ added: 2, skipped: 1, invalid: 0 })).toBe(
      '2 jogos importados; 1 já existia e foi ignorado.',
    );
  });

  it('acrescenta o aviso de itens inválidos ao final da frase', () => {
    expect(describeImport({ added: 2, skipped: 0, invalid: 1 })).toBe(
      '2 jogos importados. 1 item inválido do arquivo foi ignorado.',
    );
    expect(describeImport({ added: 1, skipped: 1, invalid: 3 })).toBe(
      '1 jogo importado; 1 já existia e foi ignorado. 3 itens inválidos do arquivo foram ignorados.',
    );
    expect(describeImport({ added: 0, skipped: 1, invalid: 2 })).toBe(
      'Nada novo: o jogo do arquivo já está na sua biblioteca. 2 itens inválidos do arquivo foram ignorados.',
    );
  });
});

describe('datas de início e término no backup', () => {
  it('mantém as datas válidas e descarta as inválidas sem perder o jogo', () => {
    const text = JSON.stringify({
      version: 2,
      games: [{ ...celeste, startedAt: '2026-03-01', finishedAt: '2026-02-30' }],
    });

    const game = parseBackup(text)?.[0];

    expect(game?.startedAt).toBe('2026-03-01');
    expect(game?.finishedAt).toBeUndefined();
  });

  it('o backup exportado leva as datas e elas voltam na importação', () => {
    const withDates = { ...celeste, startedAt: '2026-03-01', finishedAt: '2026-03-15' };

    expect(parseBackup(exportBackup([withDates]))).toEqual([withDates]);
  });
});
