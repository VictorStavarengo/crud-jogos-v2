import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { GAMES_STORAGE_KEY } from './constants/storageKeys';
import { readFileAsText } from './utils/download';

const celeste = {
  id: '1',
  name: 'Celeste',
  genre: 'Plataforma',
  platform: 'Switch',
  status: 'Zerado',
  rating: 5,
  notes: 'Subi a montanha inteira.',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const hades = {
  id: '2',
  name: 'Hades',
  genre: 'Roguelike',
  platform: 'PC',
  status: 'Jogando',
  rating: 4,
  createdAt: '2026-02-01T00:00:00.000Z',
};

function seed(games: unknown[]) {
  localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify({ version: 2, games }));
}

/** Cadastra um jogo pelo formulário, sem usar a RAWG (cadastro manual). */
function addManually(name: string, platform = '') {
  fireEvent.change(screen.getByLabelText('Nome do jogo'), { target: { value: name } });
  fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));
  if (platform) fireEvent.change(screen.getByLabelText('Plataforma'), { target: { value: platform } });
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar à lista' }));
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('VITE_RAWG_API_KEY', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('com jogos salvos', () => {
    beforeEach(() => seed([celeste, hades]));

    it('permite desfazer a exclusão de um jogo', async () => {
      render(<App />);

      fireEvent.click(screen.getByLabelText('Excluir Celeste'));
      expect(screen.queryByLabelText('Excluir Celeste')).not.toBeInTheDocument();

      fireEvent.click(await screen.findByRole('button', { name: 'Desfazer' }));
      expect(screen.getByLabelText('Excluir Celeste')).toBeInTheDocument();
    });

    it('ao editar, rola até o formulário e foca o campo de nome', () => {
      render(<App />);

      fireEvent.click(screen.getByLabelText('Editar Celeste'));

      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
      expect(screen.getByLabelText('Nome')).toHaveValue('Celeste');
      expect(screen.getByLabelText('Nome')).toHaveFocus();
    });

    it('mostra a atribuição à RAWG com link', () => {
      render(<App />);

      expect(screen.getByRole('link', { name: 'RAWG' })).toHaveAttribute('href', 'https://rawg.io');
    });

    it('abre e fecha os detalhes do jogo', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Celeste' }));

      const dialog = screen.getByRole('dialog', { name: 'Celeste' });
      expect(within(dialog).getByText('Subi a montanha inteira.')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('editar a partir dos detalhes fecha a janela e abre o formulário de edição', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Celeste' }));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Editar' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Nome')).toHaveValue('Celeste');
    });

    it('filtra pela busca ignorando acentos e mostra um aviso útil quando nada combina', () => {
      render(<App />);

      fireEvent.change(screen.getByLabelText('Buscar jogo por título'), { target: { value: 'mario' } });

      expect(screen.getByText('Nenhum jogo encontrado')).toBeInTheDocument();
      expect(screen.getByText(/Não encontramos jogos para "mario"/)).toBeInTheDocument();
      expect(screen.queryByText('Sua biblioteca está vazia')).not.toBeInTheDocument();

      // existe um botão na barra de filtros e outro no aviso da lista: qualquer um serve
      fireEvent.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0]);
      expect(screen.getByLabelText('Excluir Celeste')).toBeInTheDocument();
    });

    it('filtra por status pelos chips e pelo resumo', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /^Zerado/ }));

      expect(screen.getByLabelText('Excluir Celeste')).toBeInTheDocument();
      expect(screen.queryByLabelText('Excluir Hades')).not.toBeInTheDocument();
    });

    it('filtra por plataforma pelo menu', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /Plataforma/ }));
      fireEvent.click(screen.getByRole('option', { name: 'PC' }));

      expect(screen.getByLabelText('Excluir Hades')).toBeInTheDocument();
      expect(screen.queryByLabelText('Excluir Celeste')).not.toBeInTheDocument();
    });

    it('ordena por nome e avisa que o arraste fica desligado', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /Ordenar/ }));
      fireEvent.click(screen.getByRole('option', { name: 'Nome (A–Z)' }));

      expect(screen.getByText(/Ordenação automática ativa/)).toBeInTheDocument();
      expect(screen.queryByLabelText('Mover Celeste')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Usar “Minha ordem”/ }));
      expect(screen.getByLabelText('Mover Celeste')).toBeInTheDocument();
    });

    it('troca o status do jogo ao clicar no status do card', () => {
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /Status de Hades: Jogando/ }));

      expect(screen.getByRole('button', { name: /Status de Hades: Zerado/ })).toBeInTheDocument();
    });

    it('não deixa cadastrar o mesmo jogo na mesma plataforma', () => {
      render(<App />);

      addManually('celeste', 'switch');

      expect(screen.getByRole('alert')).toHaveTextContent('Esse jogo já está na sua biblioteca nessa plataforma.');
      expect(screen.getAllByLabelText('Excluir Celeste')).toHaveLength(1);
    });

    it('permite o mesmo jogo em outra plataforma', () => {
      render(<App />);

      addManually('Celeste', 'PC');

      expect(screen.getAllByLabelText('Excluir Celeste')).toHaveLength(2);
    });
  });

  describe('fluxo completo', () => {
    it('adiciona, edita, exclui e desfaz um jogo', async () => {
      render(<App />);
      expect(screen.getByText('Sua biblioteca está vazia')).toBeInTheDocument();

      // adicionar
      addManually('Hollow Knight', 'PC');
      expect(await screen.findByLabelText('Excluir Hollow Knight')).toBeInTheDocument();

      // editar
      fireEvent.click(screen.getByLabelText('Editar Hollow Knight'));
      fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Hollow Knight: Silksong' } });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
      expect(await screen.findByLabelText('Excluir Hollow Knight: Silksong')).toBeInTheDocument();
      expect(screen.queryByLabelText('Excluir Hollow Knight')).not.toBeInTheDocument();

      // excluir
      fireEvent.click(screen.getByLabelText('Excluir Hollow Knight: Silksong'));
      expect(screen.queryByLabelText('Excluir Hollow Knight: Silksong')).not.toBeInTheDocument();
      expect(screen.getByText('Sua biblioteca está vazia')).toBeInTheDocument();

      // desfazer
      fireEvent.click(await screen.findByRole('button', { name: 'Desfazer' }));
      expect(screen.getByLabelText('Excluir Hollow Knight: Silksong')).toBeInTheDocument();
    });

    it('salva os jogos no localStorage', () => {
      render(<App />);

      addManually('Celeste', 'Switch');

      const saved = JSON.parse(localStorage.getItem(GAMES_STORAGE_KEY) ?? 'null');
      expect(saved.games).toHaveLength(1);
      expect(saved.games[0].name).toBe('Celeste');
    });
  });

  describe('backup', () => {
    afterEach(() => {
      Reflect.deleteProperty(URL, 'createObjectURL');
      Reflect.deleteProperty(URL, 'revokeObjectURL');
    });

    it('exporta a biblioteca como um arquivo .json', async () => {
      seed([celeste, hades]);
      const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:falso');
      Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
      Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
      let downloadName = '';
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        downloadName = this.download;
      });
      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: 'Exportar jogos' }));

      expect(downloadName).toMatch(/^catalogo-de-jogos-\d{4}-\d{2}-\d{2}\.json$/);
      const exported = JSON.parse(await readFileAsText(createObjectURL.mock.calls[0][0]));
      expect(exported.games.map((g: { name: string }) => g.name)).toEqual(['Celeste', 'Hades']);
    });

    it('não deixa exportar uma biblioteca vazia', () => {
      render(<App />);

      expect(screen.getByRole('button', { name: 'Exportar jogos' })).toBeDisabled();
    });

    it('importa um backup somando só os jogos novos', async () => {
      seed([celeste]);
      render(<App />);
      const backup = JSON.stringify({ version: 2, games: [celeste, hades] });
      const file = new File([backup], 'backup.json', { type: 'application/json' });

      fireEvent.change(screen.getByLabelText('Arquivo de backup (.json)'), { target: { files: [file] } });

      expect(await screen.findByLabelText('Excluir Hades')).toBeInTheDocument();
      expect(screen.getAllByLabelText('Excluir Celeste')).toHaveLength(1);
      expect(await screen.findByText('1 jogo importado; 1 já existia e foi ignorado.')).toBeInTheDocument();
    });

    it('recusa um arquivo que não é um backup válido', async () => {
      render(<App />);
      const file = new File(['isso não é json'], 'lixo.json', { type: 'application/json' });

      fireEvent.change(screen.getByLabelText('Arquivo de backup (.json)'), { target: { files: [file] } });

      expect(await screen.findByText('Esse arquivo não é um backup válido deste app.')).toBeInTheDocument();
      expect(screen.getByText('Sua biblioteca está vazia')).toBeInTheDocument();
    });

    it('restaura uma biblioteca vazia a partir de um backup', async () => {
      render(<App />);
      const file = new File([JSON.stringify({ version: 2, games: [celeste, hades] })], 'backup.json');

      fireEvent.change(screen.getByLabelText('Arquivo de backup (.json)'), { target: { files: [file] } });

      expect(await screen.findByText('2 jogos importados.')).toBeInTheDocument();
      expect(screen.getByLabelText('Excluir Celeste')).toBeInTheDocument();
      expect(screen.getByLabelText('Excluir Hades')).toBeInTheDocument();
    });
  });

  describe('sugestões de plataforma e gênero', () => {
    it('oferece como sugestão o que já foi usado na biblioteca', () => {
      seed([celeste, hades]);
      render(<App />);

      fireEvent.change(screen.getByLabelText('Nome do jogo'), { target: { value: 'Outro jogo' } });
      fireEvent.click(screen.getByRole('button', { name: /manualmente/i }));
      fireEvent.click(within(screen.getByRole('group', { name: 'Sugestões de plataforma' })).getByRole('button', { name: 'Switch' }));

      expect(screen.getByLabelText('Plataforma')).toHaveValue('Switch');
    });
  });

  describe('armazenamento indisponível', () => {
    it('avisa que os jogos não estão sendo salvos', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('cheio');
      });

      render(<App />);

      expect(screen.getByText(/não estão sendo salvos/)).toBeInTheDocument();
    });

    it('não mostra o aviso quando o armazenamento funciona', () => {
      render(<App />);

      expect(screen.queryByText(/não estão sendo salvos/)).not.toBeInTheDocument();
    });
  });
});
