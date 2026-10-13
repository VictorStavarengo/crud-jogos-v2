import { useState } from 'react';
import type { Game, GameInput } from '../types/game';
import { draftFromGame, draftFromSuggestion, emptyDraft, type GameDraft } from '../utils/gameDraft';
import { GameSearch } from './GameSearch';
import { GameDetailsForm } from './GameDetailsForm';

interface GameFormProps {
  editingGame: Game | null;
  /** Plataformas e gêneros já usados na biblioteca (sugestões no formulário). */
  knownPlatforms?: string[];
  knownGenres?: string[];
  /** Devolve uma mensagem de erro (ex.: jogo duplicado) para o formulário exibir. */
  onSubmit: (input: GameInput) => string | null | undefined;
  onCancelEdit: () => void;
}

/**
 * Orquestra as duas etapas do cadastro:
 *  1. buscar o jogo na RAWG (ou escolher cadastro manual);
 *  2. preencher as notas pessoais.
 * Ao editar, começa direto na etapa 2. O pai usa `key` para reiniciar o formulário
 * quando o jogo em edição muda, então não precisa sincronizar props com state.
 */
export function GameForm({
  editingGame,
  knownPlatforms,
  knownGenres,
  onSubmit,
  onCancelEdit,
}: GameFormProps) {
  const [draft, setDraft] = useState<GameDraft | null>(() =>
    editingGame ? draftFromGame(editingGame) : null,
  );
  const [focusSearch, setFocusSearch] = useState(false);

  function backToSearch() {
    setDraft(null);
    setFocusSearch(true);
  }

  function handleSubmit(input: GameInput): string | null {
    const error = onSubmit(input);
    if (error) return error;
    if (!editingGame) backToSearch();
    return null;
  }

  if (!draft) {
    return (
      <GameSearch
        autoFocus={focusSearch}
        onPick={(suggestion) => setDraft(draftFromSuggestion(suggestion))}
        onManual={(name) => setDraft(emptyDraft(name))}
      />
    );
  }

  return (
    <GameDetailsForm
      initial={draft}
      knownPlatforms={knownPlatforms}
      knownGenres={knownGenres}
      isEditing={Boolean(editingGame)}
      onSubmit={handleSubmit}
      onChangeGame={backToSearch}
      onCancel={onCancelEdit}
    />
  );
}
