import { GAME_STATUSES, type GameStatus } from '../types/game';
import { STATUS_DOT } from '../constants/statusStyle';

interface StatusPickerProps {
  value: GameStatus;
  onChange: (status: GameStatus) => void;
}

/** Escolha de status em "chips" (radios de verdade: setas do teclado funcionam). */
export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <fieldset>
      <legend className="mb-1 block text-sm text-muted">Status</legend>
      <div className="flex flex-wrap gap-2">
        {GAME_STATUSES.map((status) => (
          <label key={status} className="cursor-pointer">
            <input
              type="radio"
              name="status"
              value={status}
              checked={value === status}
              onChange={() => onChange(status)}
              className="peer sr-only"
            />
            <span className="inline-flex items-center gap-1.5 rounded-card border border-edge bg-surface-2 px-3 py-1.5 text-sm text-muted transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-text/50 hover:text-ink active:scale-95 peer-checked:border-transparent peer-checked:bg-accent peer-checked:font-semibold peer-checked:text-accent-ink peer-focus-visible:ring-2 peer-focus-visible:ring-focus peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
              {status}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
