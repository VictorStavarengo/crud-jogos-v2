import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLocalStorage, type StorageCodec } from './useLocalStorage';

const codec: StorageCodec<string[]> = {
  serialize: (v) => JSON.stringify(v),
  deserialize: (raw) => {
    try { return JSON.parse(raw) as string[]; } catch { return undefined; }
  },
};

describe('useLocalStorage', () => {
  it('atualiza quando outra aba grava', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('k', [], codec));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'k', newValue: '["Zelda"]' }));
    });
    expect(result.current[0]).toEqual(['Zelda']);
  });

  it('guarda cópia do conteúdo ilegível antes de sobrescrever', () => {
    localStorage.setItem('k2', '{quebrado');
    renderHook(() => useLocalStorage<string[]>('k2', [], codec));
    expect(localStorage.getItem('k2:unreadable')).toBe('{quebrado');
  });
});