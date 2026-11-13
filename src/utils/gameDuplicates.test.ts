import { describe, expect, it } from 'vitest';
import { findDuplicate } from './gameDuplicates';
import type { Game } from '../types/game';

const eldenPc: Game = {
  id: '1',
  name: 'Elden Ring',
  genre: 'RPG',
  platform: 'PC',
  status: 'Jogando',
  rating: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('findDuplicate', () => {
  it('acha o mesmo jogo na mesma plataforma, ignorando acento e caixa', () => {
    expect(findDuplicate([eldenPc], { name: '  ELDEN ring ', platform: 'pc' })).toBe(eldenPc);
  });

  it('permite o mesmo jogo em outra plataforma', () => {
    expect(findDuplicate([eldenPc], { name: 'Elden Ring', platform: 'PlayStation' })).toBeUndefined();
  });

  it('ignora o próprio jogo ao editar', () => {
    expect(findDuplicate([eldenPc], { name: 'Elden Ring', platform: 'PC' }, '1')).toBeUndefined();
  });

  it('não acusa duplicado quando o nome é diferente', () => {
    expect(findDuplicate([eldenPc], { name: 'Elden Ring Nightreign', platform: 'PC' })).toBeUndefined();
  });
});
