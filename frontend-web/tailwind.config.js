/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // 🎨 PALETA DE COLORES AGROTOUR
      colors: {
        agro: {
          // Verde: Naturaleza, crecimiento, éxito
          green: {
            light: '#86EFAC',
            DEFAULT: '#16A34A',
            dark: '#14532D',
          },
          // Café: Tierra, robustez, calidez
          brown: {
            light: '#E7E5E4',
            DEFAULT: '#78350F',
            dark: '#451A03',
          },
          // Azul: Agua, confianza, tecnología
          blue: {
            light: '#E0F2FE',
            DEFAULT: '#0284C7',
            dark: '#0C4A6E',
          },
          // Crema: Limpieza, aire
          cream: '#FAFAF9',
          // Acento: Dorado cosecha
          accent: '#F59E0B',
        }
      },
      // 🔤 TIPOGRAFÍA
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Montserrat"', 'sans-serif'],
      },
      // 🖼️ SOMBRAS
      boxShadow: {
        'card': '0 4px 6px -1px rgba(75, 54, 33, 0.1), 0 2px 4px -1px rgba(75, 54, 33, 0.06)',
        'floating': '0 10px 15px -3px rgba(22, 163, 74, 0.2), 0 4px 6px -2px rgba(22, 163, 74, 0.1)',
      },
      // 🎬 ANIMACIONES
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};