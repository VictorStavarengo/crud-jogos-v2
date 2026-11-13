import { useState } from 'react';
import { StarIcon } from './icons';

interface StarRatingProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const STARS = [1, 2, 3, 4, 5];

/** Nota de 1 a 5 com prévia ao passar o mouse. Usa radios de verdade (teclado e leitor de tela). */
export function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  return (
    <fieldset>
      <legend className="mb-1 block text-sm text-muted">Nota</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(null)}>
        {STARS.map((star) => (
          <label key={star} className="cursor-pointer" onMouseEnter={() => setHover(star)}>
            <input
              type="radio"
              name="rating"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              aria-label={`${star} de 5`}
              className="peer sr-only"
            />
            <StarIcon
              filled={star <= shown}
              className={`h-7 w-7 rounded transition-all duration-150 hover:scale-125 active:scale-90 peer-focus-visible:ring-2 peer-focus-visible:ring-focus ${
                star <= shown ? 'text-warning' : 'text-muted/50'
              }`}
            />
          </label>
        ))}

        <span className="ml-2 text-sm text-muted" aria-live="polite">
          {value === null ? 'Sem nota' : `${value} de 5`}
        </span>

        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-1 cursor-pointer rounded px-1 text-xs text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
          >
            Limpar
          </button>
        )}
      </div>
    </fieldset>
  );
}
