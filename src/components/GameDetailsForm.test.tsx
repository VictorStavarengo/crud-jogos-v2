import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameDetailsForm } from './GameDetailsForm';
import { emptyDraft, type GameDraft } from '../utils/gameDraft';

const fromApi: GameDraft = {
  ...emptyDraft('Elden Ring'),
  platformOptions: ['PC', 'PlayStation 5', 'Xbox One'],
  genreOptions: ['Ação', 'RPG'],
};

function setup(overrides: Partial<Parameters<typeof GameDetailsForm>[0]> = {}) {
  const props = {
    initial: fromApi,
    isEditing: false,
    onSubmit: vi.fn(),
    onChangeGame: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  render(<GameDetailsForm {...props} />);
  return props;
}

describe('GameDetailsForm — plataforma e gênero', () => {
  it('mostra as opções da RAWG e pede para a pessoa escolher', () => {
    setup();

    expect(screen.getByRole('button', { name: 'PlayStation 5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'RPG' })).toBeInTheDocument();
    expect(screen.getByText(/A RAWG lista várias plataformas/)).toBeInTheDocument();
    expect(screen.getByLabelText('Plataforma')).toHaveValue('');
  });

  it('escolher uma opção preenche o campo e é enviado ao salvar', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('button', { name: 'PlayStation 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'RPG' }));

    expect(screen.getByLabelText('Plataforma')).toHaveValue('PlayStation 5');
    expect(screen.getByRole('button', { name: 'PlayStation 5' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText(/A RAWG lista várias plataformas/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(props.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'PlayStation 5', genre: 'RPG' }),
    );
  });

  it('clicar de novo na opção escolhida limpa o campo', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: 'PC' }));
    fireEvent.click(screen.getByRole('button', { name: 'PC' }));

    expect(screen.getByLabelText('Plataforma')).toHaveValue('');
  });

  it('continua aceitando um valor digitado à mão', () => {
    const props = setup();

    fireEvent.change(screen.getByLabelText('Plataforma'), { target: { value: 'Steam Deck' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(props.onSubmit).toHaveBeenCalledWith(expect.objectContaining({ platform: 'Steam Deck' }));
  });

  it('também sugere o que já foi usado na biblioteca, sem repetir o que veio da RAWG', () => {
    setup({ knownPlatforms: ['Switch', 'pc'], knownGenres: ['Plataforma'] });

    expect(screen.getByRole('button', { name: 'Switch' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plataforma' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^pc$/i })).toHaveLength(1);
  });

  it('no cadastro manual, sem opções, não mostra grupo de sugestões', () => {
    setup({ initial: emptyDraft('Meu jogo') });

    expect(screen.queryByRole('group', { name: /Sugestões de plataforma/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/A RAWG lista/)).not.toBeInTheDocument();
  });

  it('já vem preenchido quando a RAWG só lista uma opção', () => {
    setup({ initial: { ...emptyDraft('Celeste'), platform: 'Nintendo Switch', platformOptions: ['Nintendo Switch'] } });

    expect(screen.getByLabelText('Plataforma')).toHaveValue('Nintendo Switch');
    expect(screen.queryByText(/A RAWG lista várias plataformas/)).not.toBeInTheDocument();
  });
});
