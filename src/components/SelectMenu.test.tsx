import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SelectMenu } from './SelectMenu';

const options = [
  { value: '', label: 'Todas' },
  { value: 'PC', label: 'PC' },
  { value: 'Switch', label: 'Switch' },
];

function setup(value = '') {
  const onChange = vi.fn();
  render(<SelectMenu label="Plataforma" value={value} options={options} onChange={onChange} />);
  return { onChange, trigger: screen.getByRole('button', { name: /Plataforma/ }) };
}

describe('SelectMenu', () => {
  it('mostra a opção atual e abre a lista ao clicar', () => {
    const { trigger } = setup();

    expect(trigger).toHaveTextContent('Todas');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('escolhe uma opção com o mouse e fecha a lista', () => {
    const { trigger, onChange } = setup();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Switch' }));

    expect(onChange).toHaveBeenCalledWith('Switch');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('escolhe com o teclado: setas e Enter', () => {
    const { trigger, onChange } = setup();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // abre, destacando a opção atual (Todas)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' }); // PC
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('PC');
  });

  it('fecha com Esc sem escolher nada', () => {
    const { trigger, onChange } = setup();

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fecha ao clicar fora', () => {
    const { trigger } = setup();

    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
