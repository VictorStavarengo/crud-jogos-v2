import type { StatusFilter } from '../types/game';
import type { GameStats as Stats, PlayStats } from '../utils/gameStats';

interface GameStatsProps {
  stats: Stats;
  activeStatus: StatusFilter;
  onSelectStatus: (status: StatusFilter) => void;
  /** Estatísticas que dependem das datas de início e término (opcional). */
  play?: PlayStats;
}

/** Frase do resumo de datas, ou `null` quando ainda não há dados para mostrar. */
function describePlay(play: PlayStats): string | null {
  const parts: string[] = [];

  if (play.finishedThisYear > 0) {
    parts.push(`${play.finishedThisYear} ${play.finishedThisYear === 1 ? 'jogo zerado' : 'jogos zerados'} em ${play.year}`);
  }
  if (play.averageDays !== null) {
    parts.push(`Tempo médio para zerar: ${play.averageDays} ${play.averageDays === 1 ? 'dia' : 'dias'}`);
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

const cardBase =
  'flex flex-col items-start rounded-card border px-4 py-3 text-left transition-all duration-150';

/** Resumo da biblioteca em cards. Os três primeiros também funcionam como atalho de filtro. */
export function GameStats({ stats, activeStatus, onSelectStatus, play }: GameStatsProps) {
  const playSummary = play ? describePlay(play) : null;
  const shortcuts: Array<{ label: string; value: number; status: StatusFilter; tone: string }> = [
    { label: stats.total === 1 ? 'Jogo' : 'Jogos', value: stats.total, status: 'Todos', tone: 'text-ink' },
    { label: 'Jogando', value: stats.jogando, status: 'Jogando', tone: 'text-success' },
    { label: stats.zerado === 1 ? 'Zerado' : 'Zerados', value: stats.zerado, status: 'Zerado', tone: 'text-warning' },
  ];

  return (
    <section aria-label="Resumo da biblioteca" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {shortcuts.map(({ label, value, status, tone }, index) => {
        const isActive = activeStatus === status;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onSelectStatus(status)}
            aria-pressed={isActive}
            title={status === 'Todos' ? 'Mostrar todos os jogos' : `Filtrar: ${status}`}
            style={{ animationDelay: `${index * 60}ms` }}
            className={`${cardBase} cursor-pointer motion-safe:animate-fade-up hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${
              isActive
                ? 'border-accent-text/60 bg-surface-2 shadow-sm'
                : 'border-edge bg-surface hover:border-accent-text/50'
            }`}
          >
            <span className={`font-display text-2xl font-bold tabular-nums ${tone}`}>{value}</span>
            <span className="text-xs text-muted">{label}</span>
          </button>
        );
      })}

      <div
        style={{ animationDelay: '180ms' }}
        className={`${cardBase} border-edge bg-surface motion-safe:animate-fade-up`}
      >
        <span className="font-display text-2xl font-bold tabular-nums text-ink">
          {stats.average ?? '—'}
        </span>
        <span className="text-xs text-muted">Nota média</span>
      </div>

      {playSummary && <p className="col-span-2 text-xs text-muted sm:col-span-4">{playSummary}</p>}
    </section>
  );
}
