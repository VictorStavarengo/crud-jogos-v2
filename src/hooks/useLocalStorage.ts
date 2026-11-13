import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { getItem, setItem, unreadableKey } from '../utils/storage';

/** Como converter o valor para/de texto. Defina como constante fora do componente. */
export interface StorageCodec<T> {
  /** Devolve `undefined` quando o texto salvo é inválido (o valor inicial é usado). */
  deserialize: (raw: string) => T | undefined;
  serialize: (value: T) => string;
}

/**
 * Igual ao useState, mas lê e grava no localStorage de forma segura e acompanha
 * as mudanças feitas em outras abas.
 * O terceiro item indica se a última gravação funcionou (`false` = não está sendo salvo).
 * Se havia algo salvo que não pôde ser lido, uma cópia do texto original fica em
 * `unreadableKey(key)` antes de o valor inicial sobrescrever.
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

    // Havia algo salvo, mas ilegível: guarda uma cópia antes de o valor inicial sobrescrever.
    if (raw !== null) setItem(unreadableKey(key), raw);

    return typeof initialValue === 'function' ? (initialValue as () => T)() : (initialValue as T);
  });
  const [storageOk, setStorageOk] = useState(true);

  // Último texto gravado ou recebido: evita regravar o que acabou de chegar de outra aba.
  const lastSerialized = useRef<string | null>(null);

  useEffect(() => {
    const serialized = codec.serialize(value);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    setStorageOk(setItem(key, serialized));
  }, [key, codec, value]);

  // Outra aba gravou: atualiza esta. O evento só dispara nas OUTRAS abas.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== key || event.newValue === null) return;
      const next = codec.deserialize(event.newValue);
      if (next === undefined) return;
      lastSerialized.current = codec.serialize(next);
      setValue(next);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, codec]);

  return [value, setValue, storageOk];
}