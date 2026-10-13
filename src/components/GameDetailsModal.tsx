import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Game } from '../types/game';
import { STATUS_DOT } from '../constants/statusStyle';
import { GameCover } from './GameCover';
import { CloseIcon } from './icons';
import { RatingStars } from './RatingStars';

interface GameDetailsModalProps {
  game: Game;
  onClose: () => void;
  onEdit: (game: Game) => void;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Janela de detalhes do jogo.
 * Acessibilidade: role="dialog" + aria-modal, foco preso dentro da janela,
 * Esc e clique no fundo fecham, e o foco volta ao elemento que abriu.
 */
export function GameDetailsModal({ game, onClose, onEdit }: GameDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // não rola a página por trás
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      // Mantém o Tab dentro da janela
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  const addedAt = new Date(game.createdAt);
  const addedLabel = Number.isNaN(addedAt.getTime()) ? null : addedAt.toLocaleDateString('pt-BR');

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm motion-safe:animate-fade-up"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-full w-full max-w-lg overflow-y-auto rounded-card border border-edge bg-surface shadow-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute right-3 top-3 z-10 cursor-pointer rounded bg-black/70 p-2 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/90 active:scale-95"
        >
          <CloseIcon />
        </button>

        <div className="aspect-video w-full overflow-hidden bg-surface-2">
          {game.coverUrl ? (
            <GameCover
              key={game.coverUrl}
              url={game.coverUrl}
              size="large"
              alt={`Capa de ${game.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center px-6 text-center font-display text-xl text-muted"
            >
              {game.name}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <h2 id={titleId} className="font-display text-2xl font-bold">
              {game.name}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {[game.genre, game.platform].filter(Boolean).join(' · ') || 'Sem gênero ou plataforma'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[game.status]}`} aria-hidden="true" />
              {game.status}
            </span>
            {game.rating !== null ? (
              <RatingStars rating={game.rating} className="h-4 w-4" />
            ) : (
              <span className="text-muted">Sem nota</span>
            )}
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold">Observações</h3>
            <p className="whitespace-pre-wrap text-sm text-muted">
              {game.notes || 'Você ainda não escreveu nada sobre este jogo.'}
            </p>
          </div>

          {addedLabel && <p className="text-xs text-muted">Adicionado em {addedLabel}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onEdit(game)}
              className="cursor-pointer rounded-card bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent/85 hover:shadow-md active:translate-y-0 active:scale-95"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-card border border-edge px-4 py-2 text-sm text-muted transition-all duration-150 hover:-translate-y-0.5 hover:bg-surface-2 hover:text-ink active:scale-95"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
