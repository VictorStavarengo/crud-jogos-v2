import { useEffect } from 'react';
import { THEME_STORAGE_KEY } from '../constants/storageKeys';
import { useLocalStorage, type StorageCodec } from './useLocalStorage';

type Theme = 'light' | 'dark';

// O tema é salvo como texto puro ('light' | 'dark'), porque o script do index.html lê assim.
const themeCodec: StorageCodec<Theme> = {
  deserialize: (raw) => (raw === 'light' || raw === 'dark' ? raw : undefined),
  serialize: (value) => value,
};

function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(THEME_STORAGE_KEY, getSystemTheme, themeCodec);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return { theme, toggleTheme };
}
