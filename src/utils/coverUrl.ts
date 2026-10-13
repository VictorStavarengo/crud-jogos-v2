const RAWG_MEDIA = 'https://media.rawg.io/media/';

export type CoverSize = 'thumb' | 'card' | 'large';

/**
 * A RAWG entrega as imagens em tamanho original (pesadas) e em formato horizontal.
 * O servidor deles também serve versões redimensionadas trocando o início do caminho:
 *  - crop/L/A/ recorta no centro já no tamanho certo (usado no card, que é 3:2);
 *  - resize/L/-/ só reduz, mantendo a proporção original.
 */
const TRANSFORMS: Record<CoverSize, string> = {
  thumb: 'crop/280/200/',
  card: 'crop/600/400/',
  large: 'resize/1024/-/',
};

/** Endereço da capa no tamanho pedido. Imagens que não são da RAWG passam sem alteração. */
export function coverUrlFor(url: string, size: CoverSize): string {
  if (!url.startsWith(RAWG_MEDIA)) return url;

  const path = url.slice(RAWG_MEDIA.length);
  if (path.startsWith('crop/') || path.startsWith('resize/')) return url;

  return `${RAWG_MEDIA}${TRANSFORMS[size]}${path}`;
}
