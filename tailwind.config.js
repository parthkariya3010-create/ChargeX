/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0E14',
        surface: '#131A24',
        elevated: '#1C2531',
        elevated2: '#232E3D',
        border: '#2A3441',
        'text-primary': '#EAF0F6',
        'text-secondary': '#8896A6',
        accent: '#35C6F4',
        accent2: '#7B61FF',
        success: '#2ED573',
        warning: '#FFB020',
        danger: '#FF4D4F',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(53,198,244,0.15), 0 0 24px rgba(53,198,244,0.12)',
        card: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
