interface IconProps {
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function SearchIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function CloseIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function GripIcon({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

export function StarIcon({ className = 'h-6 w-6', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...base}
      strokeWidth={1.8}
      fill={filled ? 'currentColor' : 'none'}
      className={className}
    >
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

export function GamepadIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.6} className={className}>
      <path d="M6 11h4M8 9v4" />
      <circle cx="15.5" cy="10.5" r="0.8" fill="currentColor" />
      <circle cx="17.5" cy="12.5" r="0.8" fill="currentColor" />
      <path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2l-1.1 5.6A3 3 0 0 0 4.6 17.4c.9 0 1.7-.4 2.2-1.1L8 14.6h8l1.2 1.7c.5.7 1.3 1.1 2.2 1.1a3 3 0 0 0 2.9-3.6l-1.1-5.6A4 4 0 0 0 17.3 5Z" />
    </svg>
  );
}

export function Spinner({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={`animate-spin ${className}`}>
      <path d="M21 12a9 9 0 1 1-6.2-8.55" />
    </svg>
  );
}
