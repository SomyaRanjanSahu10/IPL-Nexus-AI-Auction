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
        rajdhani: ['Rajdhani', 'sans-serif'],
        exo: ['Exo 2', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#050a14',
          2: '#0b1220',
          3: '#111927',
          4: '#162030',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#7c3aed',
          amber: '#f59e0b',
          green: '#10b981',
          red: '#ef4444',
          pink: '#ec4899',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #00d4ff, #7c3aed)',
        'gradient-fire': 'linear-gradient(135deg, #f59e0b, #ef4444)',
        'gradient-dark': 'linear-gradient(180deg, #050a14 0%, #0b1220 100%)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease',
        'slide-in': 'slideIn 0.3s ease',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(20px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0,212,255,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0,212,255,0.8), 0 0 40px rgba(0,212,255,0.4)' },
        },
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0,212,255,0.4)',
        'neon-purple': '0 0 20px rgba(124,58,237,0.4)',
        'neon-green': '0 0 20px rgba(16,185,129,0.4)',
        'neon-red': '0 0 20px rgba(239,68,68,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
