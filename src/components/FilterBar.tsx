import { GAME_STATUSES, type GameStatus, type StatusFilter } from '../types/game';
import { STATUS_DOT } from '../constants/statusStyle';
import { hasActiveFilters, type GameFilters } from '../utils/gameFilters';
import { GAME_SORT_OPTIONS, type GameSort } from '../utils/gameSort';
import { CloseIcon, SearchIcon } from './icons';
import { SelectMenu } from './SelectMenu';
import { inputClass } from './styles';

interface FilterBarProps {
  filters: GameFilters;
  onFilterChange: (patch: Partial<GameFilters>) => void;
  onClearFilters: () => void;
  sort: GameSort;
  onSortChange: (sort: GameSort) => void;
  counts: Record<GameStatus, number>;
  total: number;
  platforms: string[];
  genres: string[];
}

export function FilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  sort,
  onSortChange,
  counts,
  total,
  platforms,
  genres,
}: FilterBarProps) {
  const statusOptions: Array<{ value: StatusFilter; count: number }> = [
    { value: 'Todos', count: total },
    ...GAME_STATUSES.map((value) => ({ value, count: counts[value] })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent-text" />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Buscar por título..."
          aria-label="Buscar jogo por título"
          className={`${inputClass} pl-9 pr-9`}
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => onFilterChange({ search: '' })}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-muted transition-all hover:scale-110 hover:bg-edge/40 hover:text-ink motion-safe:animate-pop"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div role="group" aria-label="Filtrar por status" className="flex flex-wrap gap-2">
        {statusOptions.map(({ value, count }) => {
          const isActive = filters.status === value;

          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onFilterChange({ status: value })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-card border px-3 py-1.5 text-sm transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'border-transparent bg-accent font-semibold text-accent-ink shadow-sm'
                  : 'border-edge bg-surface text-muted hover:-translate-y-0.5 hover:border-accent-text/50 hover:text-ink hover:shadow-md'
              }`}
            >
              {value !== 'Todos' && (
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[value]}`} aria-hidden="true" />
              )}
              {value}
              <span
                className={`rounded px-1.5 text-xs tabular-nums ${
                  isActive ? 'bg-accent-ink/15' : 'bg-surface-2'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {platforms.length > 0 && (
          <SelectMenu
            label="Plataforma"
            value={filters.platform}
            options={[{ value: '', label: 'Todas' }, ...platforms.map((p) => ({ value: p, label: p }))]}
            onChange={(platform) => onFilterChange({ platform })}
          />
        )}

        {genres.length > 0 && (
          <SelectMenu
            label="Gênero"
            value={filters.genre}
            options={[{ value: '', label: 'Todos' }, ...genres.map((g) => ({ value: g, label: g }))]}
            onChange={(genre) => onFilterChange({ genre })}
          />
        )}

        <SelectMenu
          label="Ordenar"
          value={sort}
          options={GAME_SORT_OPTIONS}
          onChange={(value) => onSortChange(value as GameSort)}
        />

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onClearFilters}
            className="cursor-pointer rounded px-2 py-1 text-sm text-accent-text transition-all hover:underline active:scale-95 motion-safe:animate-pop"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
