/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Deep Ocean Theme - Blue/Cyan Gradient Palette
      colors: {
        ocean: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#1890ff',
          600: '#096dd9',
          700: '#0050b3',
          800: '#003a8c',
          900: '#002766',
          950: '#001529',
        },
        cyan: {
          50: '#e6fffb',
          100: '#b5f5ec',
          200: '#87e8de',
          300: '#5cdbd3',
          400: '#36cfc9',
          500: '#13c2c2',
          600: '#08979c',
          700: '#006d75',
          800: '#00474f',
          900: '#002329',
        },
        // Semantic colors for status
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      // Apple-Inspired Typography Scale
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],    // 13px
        sm: ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.01em' }],     // 14px
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],              // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],     // 18px
        xl: ['1.25rem', { lineHeight: '1.875rem', letterSpacing: '-0.01em' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],            // 48px
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],         // 60px
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],          // 72px
        '8xl': ['5.25rem', { lineHeight: '1', letterSpacing: '-0.02em' }],         // 84px
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Fira Code',
          'Dank Mono',
          'monospace',
        ],
      },
      // Consistent Border Radius System
      borderRadius: {
        sm: '0.375rem',    // 6px
        DEFAULT: '0.5rem', // 8px
        md: '0.625rem',    // 10px
        lg: '0.75rem',     // 12px
        xl: '1rem',        // 16px
        '2xl': '1.25rem',  // 20px
        '3xl': '1.5rem',   // 24px
        '4xl': '2rem',     // 32px
        '5xl': '2.5rem',   // 40px
      },
      // Custom Shadow Utilities with Ocean Theme
      boxShadow: {
        'ocean-sm': '0 1px 3px rgba(9, 109, 217, 0.12), 0 1px 2px rgba(9, 109, 217, 0.06)',
        'ocean-md': '0 4px 6px rgba(9, 109, 217, 0.07), 0 2px 4px rgba(9, 109, 217, 0.06)',
        'ocean-lg': '0 10px 15px rgba(9, 109, 217, 0.1), 0 4px 6px rgba(9, 109, 217, 0.05)',
        'ocean-xl': '0 20px 25px rgba(9, 109, 217, 0.1), 0 10px 10px rgba(9, 109, 217, 0.04)',
        'ocean-2xl': '0 25px 50px rgba(9, 109, 217, 0.15)',
        'ocean-inner': 'inset 0 2px 4px rgba(9, 109, 217, 0.06)',
        'glow-cyan': '0 0 20px rgba(19, 194, 194, 0.4), 0 0 40px rgba(19, 194, 194, 0.2)',
        'glow-ocean': '0 0 20px rgba(24, 144, 255, 0.4), 0 0 40px rgba(24, 144, 255, 0.2)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      // Advanced Animations
      animation: {
        'fade-in': 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-out': 'scaleOut 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'counter': 'counter 2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            transform: 'translateY(20px)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)', 
            opacity: '1' 
          },
        },
        slideDown: {
          '0%': { 
            transform: 'translateY(-20px)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)', 
            opacity: '1' 
          },
        },
        slideInRight: {
          '0%': { 
            transform: 'translateX(100%)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateX(0)', 
            opacity: '1' 
          },
        },
        slideInLeft: {
          '0%': { 
            transform: 'translateX(-100%)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateX(0)', 
            opacity: '1' 
          },
        },
        scaleIn: {
          '0%': { 
            transform: 'scale(0.9)', 
            opacity: '0' 
          },
          '100%': { 
            transform: 'scale(1)', 
            opacity: '1' 
          },
        },
        scaleOut: {
          '0%': { 
            transform: 'scale(1)', 
            opacity: '1' 
          },
          '100%': { 
            transform: 'scale(0.9)', 
            opacity: '0' 
          },
        },
        shimmer: {
          '0%': { 
            backgroundPosition: '-200% center' 
          },
          '100%': { 
            backgroundPosition: '200% center' 
          },
        },
        bounceSubtle: {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-5px)' 
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-10px)' 
          },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(19, 194, 194, 0.4)' 
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(19, 194, 194, 0.6), 0 0 40px rgba(24, 144, 255, 0.3)' 
          },
        },
        counter: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.5)'
          },
          '50%': {
            transform: 'scale(1.1)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
      },
      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      // 3D Transform Perspective
      transformOrigin: {
        'center-3d': '50% 50% -100px',
      },
      // Custom Gradient Stops
      gradientColorStops: {
        'ocean-gradient': 'from-ocean-600 via-cyan-500 to-ocean-400',
      },
      // Z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      // Transition durations
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
      // Custom transitions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};