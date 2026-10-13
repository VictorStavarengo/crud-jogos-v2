import { StarIcon } from './icons';

interface RatingStarsProps {
  rating: number;
  className?: string;
}

/** Nota só para leitura: ★★★★☆ com texto alternativo "Nota 4 de 5". */
export function RatingStars({ rating, className = 'h-3.5 w-3.5' }: RatingStarsProps) {
  return (
    <span role="img" aria-label={`Nota ${rating} de 5`} className="inline-flex flex-shrink-0 gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          filled={star <= rating}
          className={`${className} ${star <= rating ? 'text-warning' : 'text-muted/40'}`}
        />
      ))}
    </span>
  );
}
