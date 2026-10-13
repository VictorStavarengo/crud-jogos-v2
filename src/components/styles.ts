/**
 * Campos de texto dos formulários.
 * O destaque de foco é uma borda + brilho suave (o contorno padrão é desligado
 * para inputs no index.css), então nunca aparecem duas linhas brancas.
 */
export const inputClass =
  'w-full rounded-card border border-edge bg-surface-2 px-3 py-2 text-sm text-ink outline-none ' +
  'transition-[border-color,box-shadow] duration-150 placeholder:text-muted/70 ' +
  'hover:border-accent-text/40 focus:border-focus focus:ring-2 focus:ring-focus/25';
