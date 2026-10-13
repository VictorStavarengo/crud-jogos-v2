import { useId, useState, type KeyboardEvent } from 'react';
import type { RawgSearchResult } from '../types/game';
import { isRawgConfigured } from '../services/rawgApi';
import { useGameSearch, type SearchStatus } from '../hooks/useGameSearch';
import { GameCover } from './GameCover';
import { SearchIcon, Spinner } from './icons';
import { inputClass } from './styles';

interface GameSearchProps {
  autoFocus?: boolean;
  onPick: (suggestion: RawgSearchResult) => void;
  onManual: (name: string) => void;
}

function getStatusMessage(status: SearchStatus, hasResults: boolean): string {
  if (!isRawgConfigured()) {
    return 'A busca automática está desativada (chave da RAWG não configurada). Digite o nome e adicione manualmente.';
  }

  switch (status) {
    case 'loading':
      return 'Buscando jogos...';
    case 'limited':
      return 'A busca está temporariamente limitada. Você pode adicionar o jogo manualmente.';
    case 'error':
      return 'Não foi possível buscar agora. Tente de novo ou adicione manualmente.';
    case 'success':
      return hasResults
        ? 'Use as setas ou o mouse para escolher o jogo — os detalhes são preenchidos automaticamente.'
        : 'Nenhum jogo encontrado. Você pode adicioná-lo manualmente.';
    default:
      return 'Comece a digitar e escolha o jogo na lista — os detalhes são preenchidos automaticamente.';
  }
}

/** Etapa 1 do cadastro: buscar o jogo na RAWG (com navegação por teclado) ou seguir para o cadastro manual. */
export function GameSearch({ autoFocus = false, onPick, onManual }: GameSearchProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dismissed, setDismissed] = useState(false);
  const { results, status } = useGameSearch(query);
  const listId = useId();
  const trimmed = query.trim();

  const isOpen = results.length > 0 && !dismissed;
  const currentIndex = isOpen && activeIndex < results.length ? activeIndex : -1;
  const optionId = (index: number) => `${listId}-option-${index}`;

  function handleChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    setDismissed(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setDismissed(false);
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setDismissed(false);
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (e.key === 'Enter' && currentIndex >= 0) {
      e.preventDefault();
      onPick(results[currentIndex]);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setDismissed(true);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="rounded-card border border-edge bg-surface p-5 transition-shadow duration-200 focus-within:shadow-lg focus-within:shadow-black/5">
      <h2 className="mb-3 font-display text-lg font-semibold">Adicionar jogo</h2>

      <div className="group relative">
        <label htmlFor="game-search" className="sr-only">
          Nome do jogo
        </label>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent-text" />
        <input
          id="game-search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={currentIndex >= 0 ? optionId(currentIndex) : undefined}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setDismissed(false)}
          onBlur={() => setDismissed(true)}
          placeholder="Digite o nome do jogo, ex: Elden Ring"
          className={`${inputClass} pl-9 pr-9`}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {status === 'loading' && (
          <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        )}

        {isOpen && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Sugestões de jogos"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-card border border-edge bg-surface-2 shadow-xl motion-safe:animate-list-in"
          >
            {results.map((suggestion, index) => {
              const isActive = index === currentIndex;

              return (
                <li
                  key={suggestion.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isActive}
                  // mantém o foco no campo ao clicar (senão o blur fecharia a lista antes do clique)
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => onPick(suggestion)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-accent/15' : ''
                  }`}
                >
                  {suggestion.background_image ? (
                    <GameCover
                      url={suggestion.background_image}
                      size="thumb"
                      className={`h-10 w-14 flex-shrink-0 rounded object-cover transition-transform duration-200 ${
                        isActive ? 'scale-110' : ''
                      }`}
                    />
                  ) : (
                    <div className="h-10 w-14 flex-shrink-0 rounded bg-edge/30" />
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className={`truncate transition-colors ${isActive ? 'text-accent-text' : ''}`}>
                      {suggestion.name}
                    </span>
                    {suggestion.released && (
                      <span className="text-xs text-muted">{suggestion.released.slice(0, 4)}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
        {status === 'loading' && <Spinner className="h-3 w-3" />}
        {getStatusMessage(status, results.length > 0)}
      </p>

      <button
        type="button"
        onClick={() => onManual(trimmed)}
        className="mt-3 cursor-pointer text-sm text-accent-text transition-all duration-150 hover:translate-x-0.5 hover:underline"
      >
        {trimmed ? `Adicionar "${trimmed}" manualmente →` : 'Adicionar manualmente →'}
      </button>
    </div>
  );
}
