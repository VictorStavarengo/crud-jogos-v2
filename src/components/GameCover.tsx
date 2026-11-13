import { useState } from 'react';
import { coverUrlFor, type CoverSize } from '../utils/coverUrl';

interface GameCoverProps {
  url: string;
  size: CoverSize;
  alt?: string;
  className?: string;
}

/**
 * Imagem de capa. Pede à RAWG a versão no tamanho certo (mais leve e já recortada);
 * se essa versão falhar ao carregar, volta para a imagem original.
 * Use `key={url}` ao trocar de capa, para o estado de erro recomeçar.
 */
export function GameCover({ url, size, alt = '', className }: GameCoverProps) {
  const [useOriginal, setUseOriginal] = useState(false);

  return (
    <img
      src={useOriginal ? url : coverUrlFor(url, size)}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setUseOriginal(true)}
      className={className}
    />
  );
}
