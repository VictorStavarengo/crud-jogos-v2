import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadTextFile, readFileAsText } from './download';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(URL, 'createObjectURL');
  Reflect.deleteProperty(URL, 'revokeObjectURL');
});

describe('downloadTextFile', () => {
  it('cria um link com o nome do arquivo, clica nele e depois libera a memória', () => {
    // Relógio falso: o revokeObjectURL roda num setTimeout e precisa acontecer DENTRO do teste,
    // antes de a limpeza (afterEach) remover o mock.
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => 'blob:falso');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
    let clickedDownload = '';
    let clickedHref = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clickedDownload = this.download;
      clickedHref = this.href;
    });

    downloadTextFile('backup.json', '{"a":1}', 'application/json');

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(clickedDownload).toBe('backup.json');
    expect(clickedHref).toBe('blob:falso');
    expect(document.querySelector('a[download]')).toBeNull(); // o link temporário é removido

    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:falso');
  });
});

describe('readFileAsText', () => {
  it('lê o conteúdo de um arquivo', async () => {
    const file = new File(['olá, mundo'], 'a.txt', { type: 'text/plain' });

    await expect(readFileAsText(file)).resolves.toBe('olá, mundo');
  });
});