import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImportDialog } from './ImportDialog';

function setup() {
  const props = {
    fileName: 'backup.json',
    incomingCount: 3,
    currentCount: 5,
    onMerge: vi.fn(),
    onReplace: vi.fn(),
    onCancel: vi.fn(),
  };
  render(<ImportDialog {...props} />);
  return props;
}

describe('ImportDialog', () => {
  it('é um diálogo modal que mostra o arquivo e as quantidades', () => {
    setup();

    const dialog = screen.getByRole('dialog', { name: 'Importar backup' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('backup.json');
    expect(dialog).toHaveTextContent('tem 3 jogos');
    expect(dialog).toHaveTextContent('tem 5 jogos');
  });

  it('começa com o foco em "Cancelar" (a opção mais segura)', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('"Somar à biblioteca" chama onMerge', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: /Somar à biblioteca/ }));

    expect(props.onMerge).toHaveBeenCalledTimes(1);
    expect(props.onReplace).not.toHaveBeenCalled();
  });

  it('"Substituir tudo" pede confirmação antes de chamar onReplace', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: /^Substituir tudo/ }));

    expect(props.onReplace).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Os 5 jogos atuais serão trocados pelos 3 jogos do arquivo');
    expect(screen.getByRole('button', { name: 'Voltar' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Sim, substituir tudo' }));

    expect(props.onReplace).toHaveBeenCalledTimes(1);
  });

  it('"Voltar" volta às opções sem substituir nada', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: /^Substituir tudo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Somar à biblioteca/ })).toBeInTheDocument();
    expect(props.onReplace).not.toHaveBeenCalled();
  });

  it('cancela com o botão, com Esc e ao clicar no fundo', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement as HTMLElement);

    expect(props.onCancel).toHaveBeenCalledTimes(3);
  });

  it('usa o singular quando há um jogo só', () => {
    render(
      <ImportDialog
        fileName="a.json"
        incomingCount={1}
        currentCount={1}
        onMerge={vi.fn()}
        onReplace={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toHaveTextContent('tem 1 jogo. Sua biblioteca atual tem 1 jogo.');
  });
});
