import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnreadableDataNotice } from './UnreadableDataNotice';
import { downloadTextFile } from '../utils/download';

vi.mock('../utils/download', () => ({ downloadTextFile: vi.fn() }));

const KEY = 'teste:games';
const COPY_KEY = `${KEY}:unreadable`;

describe('UnreadableDataNotice', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(downloadTextFile).mockClear();
  });

  it('não aparece quando não há cópia guardada', () => {
    render(<UnreadableDataNotice storageKey={KEY} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('avisa e oferece as ações quando há uma cópia guardada', () => {
    localStorage.setItem(COPY_KEY, '{quebrado');

    render(<UnreadableDataNotice storageKey={KEY} />);

    expect(screen.getByRole('status')).toHaveTextContent('não puderam ser lidos');
    expect(screen.getByRole('button', { name: 'Baixar cópia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apagar cópia' })).toBeInTheDocument();
  });

  it('baixa a cópia com o conteúdo original, sem alterá-lo', () => {
    localStorage.setItem(COPY_KEY, '{quebrado');
    render(<UnreadableDataNotice storageKey={KEY} />);

    fireEvent.click(screen.getByRole('button', { name: 'Baixar cópia' }));

    expect(downloadTextFile).toHaveBeenCalledWith(
      'catalogo-de-jogos-dados-ilegiveis.json',
      '{quebrado',
      'application/json',
    );
    // baixar não apaga: a pessoa ainda pode tentar de novo
    expect(localStorage.getItem(COPY_KEY)).toBe('{quebrado');
  });

  it('apaga a cópia e some ao clicar em "Apagar cópia"', () => {
    localStorage.setItem(COPY_KEY, '{quebrado');
    render(<UnreadableDataNotice storageKey={KEY} />);

    fireEvent.click(screen.getByRole('button', { name: 'Apagar cópia' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(localStorage.getItem(COPY_KEY)).toBeNull();
  });
});