import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// O jsdom não implementa scrollIntoView nem ResizeObserver (usado pelo dnd-kit).
Element.prototype.scrollIntoView = vi.fn();

if (!globalThis.ResizeObserver) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
}