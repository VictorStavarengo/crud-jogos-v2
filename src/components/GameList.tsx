import { useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Game, GameStatus } from '../types/game';
import { GameCard } from './GameCard';
import { SortableGameCard } from './SortableGameCard';
import { GamepadIcon, SearchIcon } from './icons';

interface GameListProps {
  games: Game[];
  /** Há jogos cadastrados (mesmo que os filtros escondam todos)? */
  hasGames: boolean;
  /** Texto digitado na busca, para a mensagem de "nenhum resultado". */
  searchTerm: string;
  /** Arrastar só faz sentido na "Minha ordem"; com ordenação automática fica desligado. */
  canReorder: boolean;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onDetails: (game: Game) => void;
  onStatusChange: (id: string, status: GameStatus) => void;
  onReorder: (activeId: string, overId: string) => void;
  onClearFilters: () => void;
}

const noop = () => undefined;
const GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4';

export function GameList({
  games,
  hasGames,
  searchTerm,
  canReorder,
  onEdit,
  onDelete,
  onDetails,
  onStatusChange,
  onReorder,
  onClearFilters,
}: GameListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const ids = useMemo(() => games.map((game) => game.id), [games]);

  const sensors = useSensors(
    // O mouse só começa a arrastar depois de mover 6px: cliques nos botões continuam funcionando.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // No toque, é preciso segurar um instante (senão atrapalharia a rolagem da página).
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nameOf = (id: UniqueIdentifier) => games.find((game) => game.id === String(id))?.name ?? 'jogo';
  const positionOf = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1;

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Pegou ${nameOf(active.id)}, na posição ${positionOf(active.id)} de ${ids.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} está sobre a posição ${positionOf(over.id)} de ${ids.length}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${nameOf(active.id)} foi movido para a posição ${positionOf(over.id)} de ${ids.length}.`
        : `${nameOf(active.id)} foi solto no mesmo lugar.`,
    onDragCancel: ({ active }) => `Movimento cancelado. ${nameOf(active.id)} voltou ao lugar.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  if (games.length === 0) {
    const term = searchTerm.trim();

    return hasGames ? (
      <div className="rounded-card border border-dashed border-edge p-10 text-center text-muted motion-safe:animate-fade-up">
        <SearchIcon className="mx-auto mb-3 h-8 w-8 opacity-60" />
        <p className="font-display text-lg text-ink">Nenhum jogo encontrado</p>
        <p className="mt-1 text-sm">
          {term ? `Não encontramos jogos para "${term}" com os filtros atuais.` : 'Nenhum jogo combina com os filtros atuais.'}
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 cursor-pointer rounded-card border border-edge px-4 py-2 text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-text/50 hover:bg-surface-2 hover:shadow-md active:scale-95"
        >
          Limpar filtros
        </button>
      </div>
    ) : (
      <div className="rounded-card border border-dashed border-edge p-10 text-center text-muted motion-safe:animate-fade-up">
        <GamepadIcon className="mx-auto mb-3 h-12 w-12 text-accent-text motion-safe:animate-float" />
        <p className="font-display text-lg text-ink">Sua biblioteca está vazia</p>
        <p className="mt-1 text-sm">Adicione seu primeiro jogo para começar.</p>
      </div>
    );
  }

  // Ordenação automática: grade simples, sem arrastar
  if (!canReorder) {
    return (
      <div className={GRID}>
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onDetails={onDetails}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    );
  }

  const activeGame = games.find((game) => game.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'Para reordenar, foque o botão de mover e pressione Espaço ou Enter. Use as setas para mudar de posição, Espaço ou Enter para soltar e Esc para cancelar.',
        },
      }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={GRID}>
          {games.map((game, index) => (
            <SortableGameCard
              key={game.id}
              game={game}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              onDetails={onDetails}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      </SortableContext>

      {/* Cópia "levantada" que acompanha o cursor enquanto arrasta */}
      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeGame ? (
          <div className="rotate-2 scale-105 cursor-grabbing shadow-2xl">
            <GameCard game={activeGame} onEdit={noop} onDelete={noop} onDetails={noop} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
