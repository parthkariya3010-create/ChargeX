/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'hsl(var(--base) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        elevated: 'hsl(var(--elevated) / <alpha-value>)',
        elevated2: 'hsl(var(--elevated2) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        'text-primary': 'hsl(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--text-secondary) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        accent2: 'hsl(var(--accent2) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px hsl(var(--accent) / 0.15), 0 0 24px hsl(var(--accent) / 0.12)',
        card: '0 1px 0 hsl(var(--text-primary) / 0.06) inset, 0 8px 24px hsl(var(--shadow-rgb) / 0.18)',
      },
      backgroundImage: {
        grid: 'linear-gradient(hsl(var(--grid-dot) / 0.18) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--grid-dot) / 0.18) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
