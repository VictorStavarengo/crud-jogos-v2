/**
 * Move um item de uma posição para outra, sem alterar a lista original.
 * Se as posições forem inválidas (ou iguais), devolve a mesma lista.
 */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }

  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
