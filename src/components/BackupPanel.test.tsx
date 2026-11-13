import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BackupPanel } from './BackupPanel';

describe('BackupPanel', () => {
  it('exporta ao clicar em "Exportar jogos"', () => {
    const onExport = vi.fn();
    render(<BackupPanel gameCount={3} onExport={onExport} onImport={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar jogos' }));

    expect(onExport).toHaveBeenCalled();
  });

  it('desativa a exportação quando não há jogos', () => {
    render(<BackupPanel gameCount={0} onExport={vi.fn()} onImport={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Exportar jogos' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Importar backup' })).toBeEnabled();
  });

  it('entrega o arquivo escolhido para importar', () => {
    const onImport = vi.fn();
    render(<BackupPanel gameCount={1} onExport={vi.fn()} onImport={onImport} />);
    const file = new File(['{}'], 'backup.json', { type: 'application/json' });

    fireEvent.change(screen.getByLabelText('Arquivo de backup (.json)'), { target: { files: [file] } });

    expect(onImport).toHaveBeenCalledWith(file);
  });

  it('não faz nada quando nenhum arquivo é escolhido', () => {
    const onImport = vi.fn();
    render(<BackupPanel gameCount={1} onExport={vi.fn()} onImport={onImport} />);

    fireEvent.change(screen.getByLabelText('Arquivo de backup (.json)'), { target: { files: [] } });

    expect(onImport).not.toHaveBeenCalled();
  });
});
