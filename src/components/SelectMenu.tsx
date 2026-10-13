import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

/**
 * Menu de seleção próprio (no lugar do <select> nativo, que não dá para estilizar).
 * Teclado: setas, Home/End, Enter/Espaço escolhem, Esc fecha. Clicar fora também fecha.
 */
export function SelectMenu({ label, value, options, onChange }: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const current = options[selectedIndex];
  const optionId = (index: number) => `${listId}-option-${index}`;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function openMenu() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (open) setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        else openMenu();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) setActiveIndex((i) => Math.max(i - 1, 0));
        else openMenu();
        break;
      case 'Home':
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        // Fechado: o clique nativo do botão abre. Aberto: escolhe a opção destacada.
        if (open) {
          e.preventDefault();
          choose(activeIndex);
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  const isFiltering = selectedIndex > 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-card border px-3 py-1.5 text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-text/50 hover:shadow-md active:scale-95 ${
          isFiltering ? 'border-accent-text/60 bg-surface-2 text-ink' : 'border-edge bg-surface text-muted'
        }`}
      >
        <span>{label}:</span>
        <span className="font-medium text-ink">{current.label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-30 mt-1 max-h-64 min-w-full overflow-auto rounded-card border border-edge bg-surface-2 py-1 shadow-xl motion-safe:animate-list-in"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                // mantém o foco no botão ao clicar
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center justify-between gap-4 whitespace-nowrap px-3 py-1.5 text-sm transition-colors ${
                  index === activeIndex ? 'bg-accent/15' : ''
                } ${isSelected ? 'font-semibold text-accent-text' : 'text-ink'}`}
              >
                {option.label}
                {isSelected && <span aria-hidden="true">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
