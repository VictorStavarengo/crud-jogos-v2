import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameDetailsForm } from './GameDetailsForm';
import { todayISODate } from '../utils/gameDates';
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

  it('avisa quando a plataforma foi pré-selecionada pelo uso da biblioteca e some ao trocar', () => {
    setup({
      initial: { ...fromApi, platform: 'PC', suggested: { platform: true, genre: false } },
    });

    expect(screen.getByLabelText('Plataforma')).toHaveValue('PC');
    expect(screen.getByText(/plataforma que você mais usa/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xbox One' }));

    expect(screen.queryByText(/plataforma que você mais usa/)).not.toBeInTheDocument();
  });

  it('já vem preenchido quando a RAWG só lista uma opção', () => {
    setup({ initial: { ...emptyDraft('Celeste'), platform: 'Nintendo Switch', platformOptions: ['Nintendo Switch'] } });

    expect(screen.getByLabelText('Plataforma')).toHaveValue('Nintendo Switch');
    expect(screen.queryByText(/A RAWG lista várias plataformas/)).not.toBeInTheDocument();
  });
});

describe('GameDetailsForm — datas de início e término', () => {
  it('não mostra datas enquanto o jogo é só um desejo', () => {
    setup();

    expect(screen.queryByLabelText('Começou em')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Terminou em')).not.toBeInTheDocument();
  });

  it('mostra o início ao jogar e o término também ao zerar', () => {
    setup();

    fireEvent.click(screen.getByRole('radio', { name: 'Jogando' }));
    expect(screen.getByLabelText('Começou em')).toBeInTheDocument();
    expect(screen.queryByLabelText('Terminou em')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Zerado' }));
    expect(screen.getByLabelText('Terminou em')).toBeInTheDocument();
  });

  it('trocar o status já preenche as datas com a data de hoje', () => {
    setup();

    fireEvent.click(screen.getByRole('radio', { name: 'Jogando' }));
    expect(screen.getByLabelText('Começou em')).toHaveValue(todayISODate());

    fireEvent.click(screen.getByRole('radio', { name: 'Zerado' }));
    expect(screen.getByLabelText('Terminou em')).toHaveValue(todayISODate());
  });

  it('envia as datas que a pessoa ajustou', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('radio', { name: 'Zerado' }));
    fireEvent.change(screen.getByLabelText('Começou em'), { target: { value: '2026-03-01' } });
    fireEvent.change(screen.getByLabelText('Terminou em'), { target: { value: '2026-03-15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(props.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'Zerado', startedAt: '2026-03-01', finishedAt: '2026-03-15' }),
    );
  });

  it('não deixa salvar um término anterior ao início', () => {
    const props = setup();

    fireEvent.click(screen.getByRole('radio', { name: 'Zerado' }));
    fireEvent.change(screen.getByLabelText('Começou em'), { target: { value: '2026-03-15' } });
    fireEvent.change(screen.getByLabelText('Terminou em'), { target: { value: '2026-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));

    expect(screen.getByRole('alert')).toHaveTextContent('A data de término não pode ser anterior à data de início.');
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('ao editar, mostra as datas já salvas', () => {
    setup({
      isEditing: true,
      initial: { ...fromApi, status: 'Zerado', startedAt: '2026-03-01', finishedAt: '2026-03-15' },
    });

    expect(screen.getByLabelText('Começou em')).toHaveValue('2026-03-01');
    expect(screen.getByLabelText('Terminou em')).toHaveValue('2026-03-15');
  });
});
