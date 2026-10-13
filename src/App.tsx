import { useMemo, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import type { Game, GameInput, GameStatus } from './types/game';
import { useGames } from './hooks/useGames';
import { useTheme } from './hooks/useTheme';
import {
  backupFileName,
  describeImport,
  exportBackup,
  MAX_BACKUP_BYTES,
  parseBackup,
} from './utils/backup';
import { downloadTextFile, readFileAsText } from './utils/download';
import { findDuplicate } from './utils/gameDuplicates';
import {
  DEFAULT_FILTERS,
  filterGames,
  hasActiveFilters,
  uniqueValues,
  type GameFilters,
} from './utils/gameFilters';
import { sortGames, type GameSort } from './utils/gameSort';
import { computeStats, countByStatus } from './utils/gameStats';
import { BackupPanel } from './components/BackupPanel';
import { FilterBar } from './components/FilterBar';
import { GameDetailsModal } from './components/GameDetailsModal';
import { GameForm } from './components/GameForm';
import { GameList } from './components/GameList';
import { GameStats } from './components/GameStats';
import { ThemeToggle } from './components/ThemeToggle';

export default function App() {
  const { games, addGame, updateGame, removeGame, restoreGame, reorderGames, importGames, storageOk } =
    useGames();
  const { theme, toggleTheme } = useTheme();
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [filters, setFilters] = useState<GameFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<GameSort>('manual');
  const formRef = useRef<HTMLDivElement>(null);

  const platforms = useMemo(() => uniqueValues(games.map((game) => game.platform)), [games]);
  const genres = useMemo(() => uniqueValues(games.map((game) => game.genre)), [games]);

  // Se o último jogo de uma plataforma/gênero for removido, o filtro some junto (em vez de esconder tudo).
  const activeFilters = useMemo<GameFilters>(
    () => ({
      ...filters,
      platform: platforms.includes(filters.platform) ? filters.platform : '',
      genre: genres.includes(filters.genre) ? filters.genre : '',
    }),
    [filters, platforms, genres],
  );

  const visibleGames = useMemo(
    () => sortGames(filterGames(games, activeFilters), sort),
    [games, activeFilters, sort],
  );
  const stats = useMemo(() => computeStats(games), [games]);
  const counts = useMemo(() => countByStatus(games), [games]);
  const detailsGame = games.find((game) => game.id === detailsId) ?? null;

  function updateFilters(patch: Partial<GameFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  /** Devolve uma mensagem de erro para o formulário mostrar, ou null quando salvou. */
  function handleSubmit(input: GameInput): string | null {
    if (findDuplicate(games, input, editingGame?.id)) {
      return input.platform.trim()
        ? 'Esse jogo já está na sua biblioteca nessa plataforma.'
        : 'Esse jogo já está na sua biblioteca.';
    }

    if (editingGame) {
      updateGame(editingGame.id, input);
      toast.success('Jogo atualizado!');
      setEditingGame(null);
    } else {
      addGame(input);
      toast.success('Jogo adicionado!');
    }

    return null;
  }

  function handleEdit(game: Game) {
    setDetailsId(null);
    setEditingGame(game);

    // O formulário fica no topo; em listas longas a pessoa precisa ser levada até ele.
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    formRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  function handleExport() {
    downloadTextFile(backupFileName(), exportBackup(games), 'application/json');
    toast.success('Backup exportado! Guarde o arquivo em um lugar seguro.');
  }

  async function handleImport(file: File) {
    try {
      if (file.size > MAX_BACKUP_BYTES) {
        toast.error('Esse arquivo é grande demais para ser um backup (limite de 5 MB).');
        return;
      }

      const incoming = parseBackup(await readFileAsText(file));
      if (!incoming) {
        toast.error('Esse arquivo não é um backup válido deste app.');
        return;
      }
      if (incoming.length === 0) {
        toast.info('O arquivo não tem nenhum jogo.');
        return;
      }

      const result = importGames(incoming);
      if (result.added > 0) toast.success(describeImport(result));
      else toast.info(describeImport(result));
    } catch {
      toast.error('Não foi possível ler o arquivo.');
    }
  }

  function handleStatusChange(id: string, status: GameStatus) {
    updateGame(id, { status });
  }

  function handleDelete(id: string) {
    const index = games.findIndex((game) => game.id === id);
    const removed = games[index];
    if (!removed) return;

    removeGame(id);
    if (editingGame?.id === id) setEditingGame(null);

    toast.info(
      ({ closeToast }) => (
        <div className="flex items-center justify-between gap-3">
          <span>“{removed.name}” removido.</span>
          <button
            type="button"
            onClick={() => {
              restoreGame(removed, index);
              closeToast?.();
            }}
            className="font-semibold underline"
          >
            Desfazer
          </button>
        </div>
      ),
      { autoClose: 6000 },
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-8 flex items-start justify-between gap-4 motion-safe:animate-fade-up">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Catálogo de Jogos
          </h1>
          <p className="mt-2 text-muted">
            Organize os jogos que você está jogando, já zerou ou ainda quer conhecer.
          </p>
        </div>

        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      {!storageOk && (
        <p
          role="status"
          className="mb-6 rounded-card border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-ink"
        >
          ⚠ Seus jogos não estão sendo salvos neste navegador (armazenamento indisponível ou cheio).
          Eles continuam na tela, mas vão sumir ao recarregar a página. Use “Exportar jogos”, lá
          embaixo, para guardar uma cópia.
        </p>
      )}

      {stats.total > 0 && (
        <div className="mb-8">
          <GameStats
            stats={stats}
            activeStatus={activeFilters.status}
            onSelectStatus={(status) => updateFilters({ status })}
          />
        </div>
      )}

      <div ref={formRef} className="mb-8 scroll-mt-4 motion-safe:animate-fade-up" style={{ animationDelay: '80ms' }}>
        <GameForm
          key={editingGame?.id ?? 'new'}
          editingGame={editingGame}
          knownPlatforms={platforms}
          knownGenres={genres}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingGame(null)}
        />
      </div>

      <div className="mb-6 motion-safe:animate-fade-up" style={{ animationDelay: '140ms' }}>
        <FilterBar
          filters={activeFilters}
          onFilterChange={updateFilters}
          onClearFilters={clearFilters}
          sort={sort}
          onSortChange={setSort}
          counts={counts}
          total={games.length}
          platforms={platforms}
          genres={genres}
        />
      </div>

      {sort !== 'manual' && games.length > 1 && (
        <p className="mb-4 flex flex-wrap items-center gap-x-2 text-xs text-muted">
          Ordenação automática ativa: para arrastar os cards, volte para a sua ordem.
          <button
            type="button"
            onClick={() => setSort('manual')}
            className="cursor-pointer text-accent-text hover:underline"
          >
            Usar “Minha ordem”
          </button>
        </p>
      )}

      <GameList
        games={visibleGames}
        hasGames={games.length > 0}
        searchTerm={activeFilters.search}
        canReorder={sort === 'manual'}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDetails={(game) => setDetailsId(game.id)}
        onStatusChange={handleStatusChange}
        onReorder={reorderGames}
        onClearFilters={clearFilters}
      />

      {hasActiveFilters(activeFilters) && visibleGames.length > 0 && (
        <p className="mt-4 text-center text-xs text-muted" aria-live="polite">
          Mostrando {visibleGames.length} de {games.length} {games.length === 1 ? 'jogo' : 'jogos'}.
        </p>
      )}

      <div className="mt-12">
        <BackupPanel gameCount={games.length} onExport={handleExport} onImport={handleImport} />
      </div>

      <footer className="mt-8 text-center text-xs text-muted">
        Dados e imagens de jogos fornecidos por{' '}
        <a
          href="https://rawg.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-text underline-offset-2 hover:underline"
        >
          RAWG
        </a>
        .
      </footer>

      {detailsGame && (
        <GameDetailsModal
          game={detailsGame}
          onClose={() => setDetailsId(null)}
          onEdit={handleEdit}
        />
      )}

      <ToastContainer theme={theme} position="bottom-right" />
    </div>
  );
}