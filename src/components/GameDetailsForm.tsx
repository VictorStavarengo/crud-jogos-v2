import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import type { GameInput } from '../types/game';
import { draftToInput, type GameDraft } from '../utils/gameDraft';
import { mergeOptions } from '../utils/options';
import { ChoiceField } from './ChoiceField';
import { GameCover } from './GameCover';
import { StarRating } from './StarRating';
import { StatusPicker } from './StatusPicker';
import { inputClass } from './styles';

interface GameDetailsFormProps {
  initial: GameDraft;
  /** Plataformas e gêneros já usados na biblioteca (viram sugestões clicáveis). */
  knownPlatforms?: string[];
  knownGenres?: string[];
  isEditing: boolean;
  /** Devolve uma mensagem de erro (ex.: jogo duplicado) ou null/undefined quando deu certo. */
  onSubmit: (input: GameInput) => string | null | undefined;
  onChangeGame: () => void;
  onCancel: () => void;
}

/** Etapa 2 do cadastro (ou edição): nome, capa e as notas pessoais sobre o jogo. */
const MAX_CHOICES = 14;

export function GameDetailsForm({
  initial,
  knownPlatforms = [],
  knownGenres = [],
  isEditing,
  onSubmit,
  onChangeGame,
  onCancel,
}: GameDetailsFormProps) {
  const [draft, setDraft] = useState<GameDraft>(initial);
  const [nameError, setNameError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  // Opções da RAWG primeiro, depois o que já foi usado na biblioteca
  const platformChoices = useMemo(
    () => mergeOptions(draft.platformOptions, knownPlatforms).slice(0, MAX_CHOICES),
    [draft.platformOptions, knownPlatforms],
  );
  const genreChoices = useMemo(
    () => mergeOptions(draft.genreOptions, knownGenres).slice(0, MAX_CHOICES),
    [draft.genreOptions, knownGenres],
  );

  // Ao editar, leva o foco para o formulário (o scroll suave fica por conta do App).
  useEffect(() => {
    if (isEditing) nameRef.current?.focus({ preventScroll: true });
  }, [isEditing]);

  function update<K extends keyof GameDraft>(key: K, value: GameDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const input = draftToInput(draft);

    if (!input.name) {
      setNameError('O nome do jogo é obrigatório.');
      nameRef.current?.focus();
      return;
    }

    const error = onSubmit(input);
    if (error) {
      setNameError(error);
      nameRef.current?.focus();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-card border border-edge bg-surface p-5 transition-shadow duration-200 focus-within:shadow-lg focus-within:shadow-black/5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          {isEditing ? 'Editar jogo' : 'Suas notas sobre este jogo'}
        </h2>
        {!isEditing && (
          <button
            type="button"
            onClick={onChangeGame}
            className="cursor-pointer text-sm text-accent-text transition-all duration-150 hover:-translate-x-0.5 hover:underline"
          >
            ← Trocar jogo
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-card bg-surface-2 p-3">
        {draft.coverUrl ? (
          <GameCover
            key={draft.coverUrl}
            url={draft.coverUrl}
            size="thumb"
            className="h-14 w-20 flex-shrink-0 rounded object-cover"
          />
        ) : (
          <div className="h-14 w-20 flex-shrink-0 rounded bg-edge/30" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-sm text-muted" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            ref={nameRef}
            value={draft.name}
            onChange={(e) => {
              update('name', e.target.value);
              setNameError(null);
            }}
            aria-required="true"
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? errorId : undefined}
            className={`${inputClass} ${nameError ? 'border-danger focus:border-danger focus:ring-danger/25' : ''}`}
          />
          {nameError && (
            <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-danger motion-safe:animate-list-in">
              ⚠ {nameError}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChoiceField
          id="genre"
          label="Gênero"
          value={draft.genre}
          onChange={(genre) => update('genre', genre)}
          options={genreChoices}
          hint={
            draft.genreOptions.length > 1 && !draft.genre.trim()
              ? 'A RAWG lista mais de um gênero: escolha o que melhor descreve o jogo (ou digite o seu).'
              : undefined
          }
        />

        <ChoiceField
          id="platform"
          label="Plataforma"
          value={draft.platform}
          onChange={(platform) => update('platform', platform)}
          options={platformChoices}
          hint={
            draft.platformOptions.length > 1 && !draft.platform.trim()
              ? 'A RAWG lista várias plataformas para este jogo: escolha em qual você joga (ou digite a sua).'
              : undefined
          }
        />
      </div>

      <StatusPicker value={draft.status} onChange={(status) => update('status', status)} />
      <StarRating value={draft.rating} onChange={(rating) => update('rating', rating)} />

      <div>
        <label className="mb-1 block text-sm text-muted" htmlFor="notes">
          Suas observações
        </label>
        <textarea
          id="notes"
          value={draft.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          placeholder="O que achou até agora, onde parou, o que quer lembrar depois..."
          className={inputClass}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="cursor-pointer rounded-card bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent/85 hover:shadow-md active:translate-y-0 active:scale-95 dark:hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]"
        >
          {isEditing ? 'Salvar alterações' : 'Adicionar à lista'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-card border border-edge px-4 py-2 text-sm text-muted transition-all duration-150 hover:-translate-y-0.5 hover:bg-surface-2 hover:text-ink active:scale-95"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}