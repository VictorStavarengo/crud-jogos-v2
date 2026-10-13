import { describe, expect, it } from 'vitest';
import { coverUrlFor } from './coverUrl';

const original = 'https://media.rawg.io/media/games/5ec/5ec1234.jpg';

describe('coverUrlFor', () => {
  it('pede à RAWG a versão recortada para o card', () => {
    expect(coverUrlFor(original, 'card')).toBe('https://media.rawg.io/media/crop/600/400/games/5ec/5ec1234.jpg');
  });

  it('usa tamanhos diferentes para miniatura e imagem grande', () => {
    expect(coverUrlFor(original, 'thumb')).toBe('https://media.rawg.io/media/crop/280/200/games/5ec/5ec1234.jpg');
    expect(coverUrlFor(original, 'large')).toBe('https://media.rawg.io/media/resize/1024/-/games/5ec/5ec1234.jpg');
  });

  it('não transforma de novo uma imagem que já é recortada ou redimensionada', () => {
    const cropped = 'https://media.rawg.io/media/crop/600/400/games/x.jpg';
    const resized = 'https://media.rawg.io/media/resize/640/-/games/x.jpg';

    expect(coverUrlFor(cropped, 'card')).toBe(cropped);
    expect(coverUrlFor(resized, 'thumb')).toBe(resized);
  });

  it('não mexe em imagens que não são da RAWG', () => {
    expect(coverUrlFor('https://exemplo.com/capa.jpg', 'card')).toBe('https://exemplo.com/capa.jpg');
  });
});
