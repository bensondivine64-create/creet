/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#F4F5F7',
        paper: '#000000',
        mist: '#1A1D24',
        line: 'rgba(255,255,255,0.08)',
        fg: '#F4F5F7',
        muted: '#8B98A5',
        blue: {
          DEFAULT: '#1546F5',
          deep: '#0A1F73',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        splashWordmark: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        splashTagline: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        splashOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-16px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        'splash-wordmark': 'splashWordmark 0.6s ease-out 0.1s both',
        'splash-tagline': 'splashTagline 0.8s ease-out 0.5s both',
        'splash-out': 'splashOut 0.5s ease-in forwards',
        'fade-in-up': 'fadeInUp 0.4s ease-out both',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
    },
  },
  plugins: [],
}
