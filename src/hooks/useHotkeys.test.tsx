import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHotkeys } from './useHotkeys';

function Harness({
  onSlash,
  onNew,
  enabled = true,
}: {
  onSlash: () => void;
  onNew: () => void;
  enabled?: boolean;
}) {
  useHotkeys({ '/': onSlash, n: onNew }, enabled);
  return <input aria-label="campo" />;
}

function setup(enabled = true) {
  const onSlash = vi.fn();
  const onNew = vi.fn();
  render(<Harness onSlash={onSlash} onNew={onNew} enabled={enabled} />);
  return { onSlash, onNew };
}

describe('useHotkeys', () => {
  it('chama a função da tecla apertada', () => {
    const { onSlash, onNew } = setup();

    fireEvent.keyDown(document.body, { key: 'n' });
    fireEvent.keyDown(document.body, { key: '/' });

    expect(onNew).toHaveBeenCalledTimes(1);
    expect(onSlash).toHaveBeenCalledTimes(1);
  });

  it('funciona também com a letra maiúscula (Caps Lock ou Shift)', () => {
    const { onNew } = setup();

    fireEvent.keyDown(document.body, { key: 'N' });

    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('ignora teclas sem atalho', () => {
    const { onSlash, onNew } = setup();

    fireEvent.keyDown(document.body, { key: 'x' });

    expect(onSlash).not.toHaveBeenCalled();
    expect(onNew).not.toHaveBeenCalled();
  });

  it('não dispara enquanto a pessoa digita num campo', () => {
    const { onSlash, onNew } = setup();

    fireEvent.keyDown(screen.getByLabelText('campo'), { key: 'n' });
    fireEvent.keyDown(screen.getByLabelText('campo'), { key: '/' });

    expect(onNew).not.toHaveBeenCalled();
    expect(onSlash).not.toHaveBeenCalled();
  });

  it('não dispara com Ctrl, Cmd ou Alt apertados', () => {
    const { onNew } = setup();

    fireEvent.keyDown(document.body, { key: 'n', ctrlKey: true });
    fireEvent.keyDown(document.body, { key: 'n', metaKey: true });
    fireEvent.keyDown(document.body, { key: 'n', altKey: true });

    expect(onNew).not.toHaveBeenCalled();
  });

  it('não faz nada quando está desativado', () => {
    const { onNew } = setup(false);

    fireEvent.keyDown(document.body, { key: 'n' });

    expect(onNew).not.toHaveBeenCalled();
  });

  it('impede o comportamento padrão da tecla (o "/" não aparece dentro do campo)', () => {
    setup();
    const event = createEvent.keyDown(document.body, { key: '/' });

    fireEvent(document.body, event);

    expect(event.defaultPrevented).toBe(true);
  });
});
