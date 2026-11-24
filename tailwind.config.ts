import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: { 950: 'rgb(var(--charcoal-950-rgb) / <alpha-value>)', 800: 'rgb(var(--charcoal-800-rgb) / <alpha-value>)' },
        vermilion: { 600: 'rgb(var(--vermilion-600-rgb) / <alpha-value>)', 400: 'rgb(var(--vermilion-400-rgb) / <alpha-value>)' },
        broth: { 100: 'rgb(var(--broth-100-rgb) / <alpha-value>)' },
        washi: { 50: 'rgb(var(--washi-50-rgb) / <alpha-value>)' },
        nori: { 900: 'rgb(var(--nori-900-rgb) / <alpha-value>)' },
      },
      fontFamily: {
        display: ['Archivo', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'sans-serif'],
      },
      letterSpacing: { label: '0.28em' },
      maxWidth: { content: '76rem' },
    },
  },
  plugins: [],
} satisfies Config;
