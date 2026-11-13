import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../hooks/useModal';

interface ImportDialogProps {
  fileName: string;
  incomingCount: number;
  currentCount: number;
  onMerge: () => void;
  onReplace: () => void;
  onCancel: () => void;
}

const jogos = (count: number) => (count === 1 ? '1 jogo' : `${count} jogos`);

const optionClass =
  'cursor-pointer rounded-card border px-4 py-3 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99]';

/**
 * Pergunta como importar um backup quando a biblioteca já tem jogos:
 * somar (seguro) ou substituir tudo (pede uma segunda confirmação).
 */
export function ImportDialog({
  fileName,
  incomingCount,
  currentCount,
  onMerge,
  onReplace,
  onCancel,
}: ImportDialogProps) {
  const { dialogRef, initialFocusRef } = useModal(onCancel);
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  const backRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Ao trocar de passo o botão clicado some: leva o foco para um botão do novo passo
  useEffect(() => {
    if (confirmingReplace) backRef.current?.focus();
  }, [confirmingReplace]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm motion-safe:animate-fade-up"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-card border border-edge bg-surface p-5 shadow-2xl"
      >
        <h2 id={titleId} className="font-display text-xl font-bold">
          Importar backup
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-muted">
          O arquivo <span className="break-all font-medium text-ink">{fileName}</span> tem{' '}
          {jogos(incomingCount)}. Sua biblioteca atual tem {jogos(currentCount)}.
        </p>

        {confirmingReplace ? (
          <div className="mt-5 flex flex-col gap-3">
            <p role="alert" className="rounded-card border border-danger/50 bg-danger/10 p-3 text-sm">
              Tem certeza? Os {jogos(currentCount)} atuais serão trocados pelos {jogos(incomingCount)}{' '}
              do arquivo. Logo depois você poderá desfazer.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onReplace}
                className="cursor-pointer rounded-card bg-danger px-4 py-2 text-sm font-semibold text-accent-ink transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95"
              >
                Sim, substituir tudo
              </button>
              <button
                ref={backRef}
                type="button"
                onClick={() => setConfirmingReplace(false)}
                className="cursor-pointer rounded-card border border-edge px-4 py-2 text-sm text-muted transition-all duration-150 hover:-translate-y-0.5 hover:bg-surface-2 hover:text-ink active:scale-95"
              >
                Voltar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={onMerge}
              className={`${optionClass} border-transparent bg-accent text-accent-ink`}
            >
              <span className="block text-sm font-semibold">Somar à biblioteca</span>
              <span className="block text-xs opacity-80">
                Mantém seus jogos e adiciona só os novos (os repetidos são ignorados).
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmingReplace(true)}
              className={`${optionClass} border-danger/60 hover:bg-danger/10`}
            >
              <span className="block text-sm font-semibold text-danger">Substituir tudo</span>
              <span className="block text-xs text-muted">
                Apaga os jogos atuais e usa só os do arquivo.
              </span>
            </button>

            <button
              ref={initialFocusRef}
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded-card border border-edge px-4 py-2 text-sm text-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink active:scale-95"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
