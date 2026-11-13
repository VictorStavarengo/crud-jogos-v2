import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GameCover } from './GameCover';

const original = 'https://media.rawg.io/media/games/5ec/5ec1234.jpg';

describe('GameCover', () => {
  it('pede a versão recortada quando a capa é da RAWG', () => {
    render(<GameCover url={original} size="card" alt="Capa" />);

    expect(screen.getByAltText('Capa')).toHaveAttribute(
      'src',
      'https://media.rawg.io/media/crop/600/400/games/5ec/5ec1234.jpg',
    );
  });

  it('volta para a imagem original se a versão recortada não carregar', () => {
    render(<GameCover url={original} size="card" alt="Capa" />);

    fireEvent.error(screen.getByAltText('Capa'));

    expect(screen.getByAltText('Capa')).toHaveAttribute('src', original);
  });

  it('não altera capas de outros sites', () => {
    render(<GameCover url="https://exemplo.com/capa.jpg" size="card" alt="Capa" />);

    expect(screen.getByAltText('Capa')).toHaveAttribute('src', 'https://exemplo.com/capa.jpg');
  });

  it('carrega só quando aparece na tela e não deixa arrastar a imagem sozinha', () => {
    render(<GameCover url={original} size="thumb" alt="Capa" />);

    expect(screen.getByAltText('Capa')).toHaveAttribute('loading', 'lazy');
    expect(screen.getByAltText('Capa')).toHaveAttribute('draggable', 'false');
  });
});
