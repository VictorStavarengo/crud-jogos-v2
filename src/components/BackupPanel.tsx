import { useId, useRef } from 'react';

interface BackupPanelProps {
  gameCount: number;
  onExport: () => void;
  onImport: (file: File) => void;
}

const buttonClass =
  'cursor-pointer rounded-card border border-edge px-4 py-2 text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-text/50 hover:bg-surface-2 hover:shadow-md active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-edge disabled:hover:bg-transparent disabled:hover:shadow-none';

/** Exportar e importar a biblioteca em um arquivo .json (os dados só existem neste navegador). */
export function BackupPanel({ gameCount, onExport, onImport }: BackupPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="rounded-card border border-edge bg-surface p-5">
      <h2 id={headingId} className="font-display text-lg font-semibold">
        Backup dos dados
      </h2>
      <p className="mt-1 text-sm text-muted">
        Seus jogos ficam salvos só neste navegador. Exporte um arquivo para guardar uma cópia ou levar
        para outro aparelho. Ao importar, os jogos novos são somados à sua biblioteca — nada é apagado.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onExport}
          disabled={gameCount === 0}
          title={gameCount === 0 ? 'Adicione um jogo para poder exportar' : undefined}
          className={buttonClass}
        >
          Exportar jogos
        </button>

        <button type="button" onClick={() => inputRef.current?.click()} className={buttonClass}>
          Importar backup
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          aria-label="Arquivo de backup (.json)"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // permite escolher o mesmo arquivo de novo depois
            if (file) onImport(file);
          }}
        />
      </div>
    </section>
  );
}
