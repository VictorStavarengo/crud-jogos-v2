import type { ReactNode } from 'react';
import type { Game, GameStatus } from '../types/game';
import { STATUS_DOT } from '../constants/statusStyle';
import { nextStatus } from '../utils/gameStatus';
import { GameCover } from './GameCover';
import { RatingStars } from './RatingStars';

interface GameCardProps {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  onDetails: (game: Game) => void;
  /** Quando informado, o status vira um botão que avança para o próximo status. */
  onStatusChange?: (id: string, status: GameStatus) => void;
  /** Alça de arrastar (fornecida pelo SortableGameCard). */
  dragHandle?: ReactNode;
  /** Posição na lista: escalona a animação de entrada. */
  index?: number;
}

export function GameCard({
  game,
  onEdit,
  onDelete,
  onDetails,
  onStatusChange,
  dragHandle,
  index = 0,
}: GameCardProps) {
  const next = nextStatus(game.status);

  const statusContent = (
    <>
      <span
        // `key` reinicia a animação "pop" sempre que o status muda
        key={game.status}
        className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_DOT[game.status]} ${
          game.status === 'Jogando' ? 'animate-pulse' : 'motion-safe:animate-pop'
        }`}
        aria-hidden="true"
      />
      <span className="truncate">{game.status}</span>
    </>
  );

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      className="group relative select-none overflow-hidden rounded-card border border-edge bg-surface transition-all duration-200 ease-out hover:-translate-y-1 hover:border-accent-text/50 hover:shadow-lg hover:shadow-black/10 motion-safe:animate-card-in dark:hover:shadow-[0_0_24px_rgba(255,255,255,0.1)]"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-surface-2">
        {/*
          A capa também abre os detalhes com o mouse. Para teclado e leitor de tela o botão
          "oficial" é o título (abaixo), então este fica fora da ordem de tabulação.
        */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onDetails(game)}
          className="block h-full w-full cursor-pointer"
        >
          {game.coverUrl ? (
            <GameCover
              key={game.coverUrl}
              url={game.coverUrl}
              size="card"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <span className="flex h-full items-center justify-center px-3 text-center text-sm font-medium text-muted">
              {game.name}
            </span>
          )}
        </button>

        {/* Observações que sobem ao passar o mouse */}
        {game.notes && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-10 pt-14 text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-3 text-xs text-white/90">{game.notes}</p>
          </div>
        )}

        {game.platform && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            {game.platform}
          </span>
        )}

        {/* Ações: sempre visíveis em telas sem mouse; aparecem no hover/foco em desktop */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-1 p-2 opacity-100 transition-opacity focus-within:opacity-100 hover-device:opacity-0 hover-device:group-hover:opacity-100">
          <div>{dragHandle}</div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onEdit(game)}
              aria-label={`Editar ${game.name}`}
              className="cursor-pointer rounded bg-black/70 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black active:scale-95"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              onClick={() => onDelete(game.id)}
              aria-label={`Excluir ${game.name}`}
              className="cursor-pointer rounded bg-black/70 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-status-dropped active:scale-95"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2.5">
        <h3 className="text-sm font-semibold text-ink">
          <button
            type="button"
            onClick={() => onDetails(game)}
            title="Ver detalhes"
            className="block w-full cursor-pointer truncate text-left transition-colors hover:text-accent-text"
          >
            {game.name}
          </button>
        </h3>

        {game.genre && <p className="truncate text-xs text-muted">{game.genre}</p>}

        <div className="mt-1.5 flex items-center justify-between gap-2">
          {onStatusChange ? (
            <button
              type="button"
              onClick={() => onStatusChange(game.id, next)}
              title={`Clique para mudar para "${next}"`}
              aria-label={`Status de ${game.name}: ${game.status}. Mudar para ${next}`}
              className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded text-xs text-muted transition-all hover:translate-x-0.5 hover:text-ink active:scale-95"
            >
              {statusContent}
            </button>
          ) : (
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
              {statusContent}
            </span>
          )}

          {game.rating !== null && <RatingStars rating={game.rating} className="h-3 w-3" />}
        </div>
      </div>
    </article>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}