import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens que trocam de valor entre claro/escuro (ver src/index.css)
        canvas: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        edge: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        focus: 'rgb(var(--focus) / <alpha-value>)',

        // Cor de destaque: fundo de botão, texto sobre ele e destaque em texto/links
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-ink': 'rgb(var(--accent-ink) / <alpha-value>)',
        'accent-text': 'rgb(var(--accent-text) / <alpha-value>)',

        // Semânticas para TEXTO (contraste ok nos dois temas)
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',

        // Cores vivas de status (pontinhos e ícones; iguais nos dois temas)
        status: {
          playing: '#22C55E',
          done: '#FF8A00',
          dropped: '#FF3B3B',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: 'var(--radius)',
      },
      // `backwards` (e não `both`): depois da animação o elemento volta ao normal.
      // Assim o `transform` do hover e do arrastar (dnd-kit) não é sobrescrito.
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'card-in': {
          '0%': { opacity: '0', transform: 'translateY(14px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pop: {
          '0%': { transform: 'scale(0.4)' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'icon-in': {
          '0%': { opacity: '0', transform: 'rotate(-90deg) scale(0.5)' },
          '100%': { opacity: '1', transform: 'rotate(0) scale(1)' },
        },
        'list-in': {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out backwards',
        'card-in': 'card-in 0.4s ease-out backwards',
        pop: 'pop 0.3s ease-out',
        'icon-in': 'icon-in 0.35s ease-out',
        'list-in': 'list-in 0.15s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // `hover-device:` só vale em aparelhos com mouse (celular/tablet não têm hover).
    plugin(({ addVariant }) => {
      addVariant('hover-device', '@media (hover: hover)');
    }),
  ],
};