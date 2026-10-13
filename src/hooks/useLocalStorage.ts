import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getItem, setItem } from '../utils/storage';

/** Como converter o valor para/de texto. Defina como constante fora do componente. */
export interface StorageCodec<T> {
  /** Devolve `undefined` quando o texto salvo é inválido (o valor inicial é usado). */
  deserialize: (raw: string) => T | undefined;
  serialize: (value: T) => string;
}

/**
 * Igual ao useState, mas lê e grava no localStorage de forma segura.
 * O terceiro item indica se a última gravação funcionou (`false` = não está sendo salvo).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  codec: StorageCodec<T>,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(() => {
    const raw = getItem(key);
    const stored = raw === null ? undefined : codec.deserialize(raw);
    if (stored !== undefined) return stored;
    return typeof initialValue === 'function' ? (initialValue as () => T)() : (initialValue as T);
  });
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    setStorageOk(setItem(key, codec.serialize(value)));
  }, [key, codec, value]);

  return [value, setValue, storageOk];
}
