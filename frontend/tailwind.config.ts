import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        primary: '#2a2a2a',
        secondary: '#3a3a3a',
        accent: '#f5f5f5',
        'accent-2': '#eaeaea',
        'accent-3': '#999999',
        'accent-4': '#888888',
        'accent-5': '#666666',
        'accent-6': '#444444',
        'accent-7': '#333333',
        'accent-8': '#111111',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}
export default config
