import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Game, GameStatus } from '../types/game';
import { GameCard } from './GameCard';
import { GripIcon } from './icons';

interface SortableGameCardProps {
  game: Game;
  index: number;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onDetails: (game: Game) => void;
  onStatusChange: (id: string, status: GameStatus) => void;
}

/**
 * Card arrastável. O card inteiro pode ser arrastado com mouse (ou segurando o dedo, no celular);
 * a alça no canto é o caminho do teclado: Espaço pega, setas movem, Espaço solta, Esc cancela.
 */
export function SortableGameCard({ game, index, ...actions }: SortableGameCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: game.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...listeners}
      className={`touch-manipulation cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30 grayscale' : ''
      }`}
    >
      <GameCard
        game={game}
        index={index}
        {...actions}
        dragHandle={
          <button
            ref={setActivatorNodeRef}
            type="button"
            aria-label={`Mover ${game.name}`}
            title="Arraste o card (ou use Espaço e as setas) para reordenar"
            {...attributes}
            className="cursor-grab rounded bg-black/70 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/90 active:scale-95"
          >
            <GripIcon />
          </button>
        }
      />
    </div>
  );
}
