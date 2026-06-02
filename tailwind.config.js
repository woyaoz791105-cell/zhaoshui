/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f4f3ee',
        shell: '#e6e8ec',
        mist: '#d7deea',
        ink: '#000000',
        olive: '#111d3a',
        brick: '#071229',
        sand: '#c9d2e3',
        sage: '#4f607a',
        slate: '#62708a',
        plum: '#14265f',
        amber: '#ccd6ea',
        accent: '#000000',
        accentDeep: '#0030a8',
        accentSoft: '#dfe7f6',
      },
      boxShadow: {
        dossier: '0 18px 40px rgba(0, 30, 105, 0.08)',
        card: '0 18px 45px rgba(0, 30, 105, 0.1)',
        sticker: '0 12px 24px rgba(0, 30, 105, 0.1)',
      },
      fontFamily: {
        sans: [
          '"Source Han Sans SC"',
          '"Noto Sans CJK SC"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        serif: [
          '"Source Han Sans SC"',
          '"Noto Sans CJK SC"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        mono: ['"IBM Plex Mono"', '"Cascadia Code"', '"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        ledger:
          'linear-gradient(to right, rgba(0, 30, 105, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 30, 105, 0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
