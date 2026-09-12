/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', '"DM Sans"', 'sans-serif'],
      },
      colors: {
        // Column.com Architectural Palette
        column: {
          navy: '#0B1B34',       // Midnight infrastructure navy
          dark: '#07152B',       // Terminal base
          deep: '#040D1A',       // Deepest dark
          surface: '#0F2342',    // Terminal secondary
          cyan: '#00D4B2',       // Electric mint / seafoam
          sky: '#38BDF8',        // Technical cyan / sky
          blue: '#1E40AF',       // Direct wire blue
          border: 'rgba(11, 27, 52, 0.08)',
          borderDark: 'rgba(255, 255, 255, 0.08)',
          slate: '#475569',
          light: '#F8FAFC',
        },
        // Distinctive Nordic Pine / Tourmaline Teal Palette
        pine: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F766E', // Primary Action Anchor
          700: '#0E5E56',
          800: '#0C4B45',
          900: '#0A3B36',
          950: '#052220', // Dark Charcoal Evergreen
        },
        // Mineral stone & slate surfaces
        stone: {
          50: '#F8FAF9', // Canvas background
          100: '#F1F4F3', // Card secondary
          200: '#E4EAE7', // Soft borders
          300: '#CBD5D0',
          400: '#94A39D',
          500: '#64746E',
          600: '#475550',
          700: '#33413C',
          800: '#1E2925',
          900: '#131C18', // Deepest Text Slate
        },
        // Warm ochre accent for priority/highlights
        ochre: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(10, 30, 25, 0.04), 0 1px 2px -1px rgba(10, 30, 25, 0.04)',
        'card': '0 4px 12px -2px rgba(10, 30, 25, 0.05), 0 2px 4px -2px rgba(10, 30, 25, 0.03)',
        'elevated': '0 16px 32px -6px rgba(10, 30, 25, 0.08), 0 6px 12px -4px rgba(10, 30, 25, 0.03)',
        'pine-glow': '0 0 24px -2px rgba(15, 118, 110, 0.22)',
      },
    },
  },
  plugins: [],
};
