import { describe, expect, it } from 'vitest';
import { nextStatus } from './gameStatus';

describe('nextStatus', () => {
  it('avança para o próximo status', () => {
    expect(nextStatus('Quero jogar')).toBe('Jogando');
    expect(nextStatus('Jogando')).toBe('Zerado');
  });

  it('volta ao primeiro depois do último', () => {
    expect(nextStatus('Abandonado')).toBe('Quero jogar');
  });
});
