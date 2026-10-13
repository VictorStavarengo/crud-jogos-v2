import { normalizeText } from '../utils/gameFilters';
import { inputClass } from './styles';

interface ChoiceFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Sugestões clicáveis (da RAWG e da própria biblioteca). */
  options: string[];
  hint?: string;
}

/** Campo de texto livre com sugestões em "chips": clicar escolhe, clicar de novo limpa. */
export function ChoiceField({ id, label, value, onChange, options, hint }: ChoiceFieldProps) {
  const current = normalizeText(value);

  return (
    <div>
      <label className="mb-1 block text-sm text-muted" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />

      {options.length > 0 && (
        <div
          role="group"
          aria-label={`Sugestões de ${label.toLowerCase()}`}
          className="mt-2 flex flex-wrap gap-1.5"
        >
          {options.map((option) => {
            const selected = normalizeText(option) === current;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(selected ? '' : option)}
                className={`cursor-pointer rounded-card border px-2.5 py-1 text-xs transition-all duration-150 active:scale-95 ${
                  selected
                    ? 'border-transparent bg-accent font-semibold text-accent-ink shadow-sm'
                    : 'border-edge bg-surface-2 text-muted hover:-translate-y-0.5 hover:border-accent-text/50 hover:text-ink'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
