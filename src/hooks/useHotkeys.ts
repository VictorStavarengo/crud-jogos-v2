import { useEffect, useRef } from 'react';

/** O foco está num campo onde a pessoa digita? Então as teclas não podem virar atalho. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Atalhos de teclado de uma tecla só (ex.: "/" e "n"), válidos na página inteira.
 * Não disparam quando a pessoa está digitando num campo, nem com Ctrl/Cmd/Alt apertados
 * (para não atrapalhar os atalhos do navegador). Passe `enabled = false` para desligar
 * (por exemplo, enquanto uma janela está aberta).
 */
export function useHotkeys(handlers: Record<string, () => void>, enabled = true): void {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const handler = handlersRef.current[event.key.toLowerCase()];
      if (!handler) return;

      event.preventDefault(); // evita, por exemplo, o "/" aparecer dentro do campo que acabou de receber o foco
      handler();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
