/**
 * Wrappers do localStorage que nunca lançam erro.
 * O storage pode estar indisponível (modo privado do Safari, política do navegador)
 * ou cheio; nesses casos o app segue funcionando, só sem persistir.
 */
export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Devolve `false` quando não foi possível gravar (sem espaço ou bloqueado). */
export function setItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
