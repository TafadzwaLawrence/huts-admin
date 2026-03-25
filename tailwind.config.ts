import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Admin dark theme tokens — pure black
        'adm-bg':        '#000000',
        'adm-surface':   '#0A0A0A',
        'adm-surface-2': '#141414',
        'adm-border':    '#222222',
        'adm-text':      '#FFFFFF',
        'adm-muted':     '#888888',
        'adm-faint':     '#444444',
        'adm-accent':    '#A855F7',
        'adm-green':     '#22C55E',
        'adm-amber':     '#F59E0B',
        'adm-red':       '#EF4444',
        'adm-blue':      '#3B82F6',
        // Legacy
        'accent-red': '#FF6B6B',
        'accent-green': '#51CF66',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Huts B&W design system semantic names
        'pure-white': '#FFFFFF',
        'off-white': '#F8F9FA',
        'light-gray': '#E9ECEF',
        'medium-gray': '#ADB5BD',
        'dark-gray': '#495057',
        'charcoal': '#212529',
        'pure-black': '#000000',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
