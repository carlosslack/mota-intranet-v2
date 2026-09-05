import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900:'#060d1f', 800:'#0c1731', 700:'#12203f', 600:'#1c2541', 500:'#3d4a6b' },
        gold: { 50:'#f5e9c8', 100:'#e9d59a', 300:'#d4af37', 500:'#b8912a', 700:'#9a7c26' },
        ink:  { 100:'#f2f2f5', 300:'#c9cad0', 500:'#94a3b8', 700:'#64748b' }
      },
      fontFamily: {
        display: ['"Instrument Sans"','system-ui','sans-serif'],
        sans: ['"DM Sans"','system-ui','sans-serif'],
        mono: ['ui-monospace','Menlo','Consolas','monospace']
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg,#f5e9c8 0%,#d4af37 45%,#9a7c26 100%)',
        'app-gradient': 'radial-gradient(ellipse at 50% -10%, rgba(212,175,55,.08) 0%, transparent 55%),linear-gradient(160deg,#060d1f 0%,#0c1731 60%,#12203f 100%)',
        'panel-gradient': 'linear-gradient(180deg, rgba(28,37,65,.55), rgba(10,17,40,.4))',
        'sidebar-gradient': 'linear-gradient(180deg, rgba(6,13,31,.9), rgba(12,23,63,.72))'
      },
      boxShadow: {
        card: '0 8px 32px rgba(0,0,0,.2)',
        'gold-glow': '0 0 22px rgba(212,175,55,.18)'
      },
      borderRadius: { pill: '50px' }
    }
  },
  plugins: []
};
export default config;
