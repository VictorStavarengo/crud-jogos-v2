import { useState } from 'react';
import { downloadTextFile } from '../utils/download';
import { getItem, removeItem, unreadableKey } from '../utils/storage';

interface UnreadableDataNoticeProps {
  /** Chave do localStorage cujos dados ilegíveis devem ser oferecidos para download. */
  storageKey: string;
}

const buttonClass =
  'cursor-pointer rounded-card border border-edge px-3 py-1.5 text-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-accent-text/50 hover:bg-surface-2 active:translate-y-0 active:scale-95';

/**
 * Aviso para quando o conteúdo salvo no navegador não pôde ser lido (corrompido ou de uma
 * versão desconhecida). O useLocalStorage guarda uma cópia do texto original à parte; aqui
 * a pessoa pode baixá-la para tentar recuperar os jogos, ou apagá-la.
 */
export function UnreadableDataNotice({ storageKey }: UnreadableDataNoticeProps) {
  const key = unreadableKey(storageKey);
  // Lido uma vez ao montar. A cópia já foi guardada antes, quando o componente pai
  // (que chama o useLocalStorage) renderizou.
  const [copy, setCopy] = useState<string | null>(() => getItem(key));

  if (copy === null) return null;
  const content = copy;

  function handleDownload() {
    downloadTextFile('catalogo-de-jogos-dados-ilegiveis.json', content, 'application/json');
  }

  function handleDelete() {
    removeItem(key);
    setCopy(null);
  }

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-3 rounded-card border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        ⚠ Os dados salvos neste navegador não puderam ser lidos, então a biblioteca começou vazia.
        Uma cópia do conteúdo original foi guardada à parte: baixe-a para tentar recuperar seus
        jogos.
      </p>
      <div className="flex flex-shrink-0 gap-2">
        <button type="button" onClick={handleDownload} className={buttonClass}>
          Baixar cópia
        </button>
        <button type="button" onClick={handleDelete} className={buttonClass}>
          Apagar cópia
        </button>
      </div>
    </div>
  );
}