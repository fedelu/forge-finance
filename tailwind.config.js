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
        fogo: {
          // Fogo-inspired color palette - flames and speed theme
          primary: '#FF4500',      // Fogo orange-red (flame)
          'primary-dark': '#E03E00', // Darker flame
          'primary-light': '#FF6B35', // Lighter flame
          secondary: '#FF6B00',    // Secondary flame
          'secondary-dark': '#E55A00',
          accent: '#FF8C00',       // Bright orange accent
          'accent-dark': '#E67E00',
          dark: '#000000',         // Pure black (Fogo's deep dark)
          'dark-light': '#0A0A0A', // Slightly lighter dark
          flame: '#FF4500',        // Main flame color
          'flame-dark': '#CC3700', // Dark flame
          'flame-light': '#FF6B35', // Light flame
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
            950: '#0A0A0A',
          },
          // Status colors
          success: '#10B981',
          'success-dark': '#059669',
          warning: '#F59E0B',
          'warning-dark': '#D97706',
          error: '#EF4444',
          'error-dark': '#DC2626',
          info: '#3B82F6',
          'info-dark': '#2563EB',
        },
        // Gradient colors - Fogo inspired
        gradient: {
          'fogo-primary': 'linear-gradient(135deg, #FF4500 0%, #FF6B00 100%)',
          'fogo-secondary': 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
          'fogo-flame': 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
          'dark-gradient': 'linear-gradient(135deg, #000000 0%, #0A0A0A 100%)',
          'speed-gradient': 'linear-gradient(135deg, #FF4500 0%, #FF8C00 50%, #FF6B35 100%)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'fogo': '0 10px 25px -5px rgba(255, 69, 0, 0.15), 0 10px 10px -5px rgba(255, 69, 0, 0.1)',
        'fogo-lg': '0 20px 25px -5px rgba(255, 69, 0, 0.2), 0 10px 10px -5px rgba(255, 69, 0, 0.1)',
        'flame': '0 0 20px rgba(255, 69, 0, 0.4)',
        'flame-lg': '0 0 40px rgba(255, 69, 0, 0.6)',
        'speed': '0 0 30px rgba(255, 69, 0, 0.3), 0 0 60px rgba(255, 140, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
