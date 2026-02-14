/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // 🎨 PALETA DE COLORES AGROTOUR (idéntica a frontend-web)
            colors: {
                agro: {
                    green: {
                        light: '#86EFAC',
                        DEFAULT: '#16A34A',
                        dark: '#14532D',
                    },
                    brown: {
                        light: '#E7E5E4',
                        DEFAULT: '#78350F',
                        dark: '#451A03',
                    },
                    blue: {
                        light: '#E0F2FE',
                        DEFAULT: '#0284C7',
                        dark: '#0C4A6E',
                    },
                    cream: '#FAFAF9',
                    accent: '#F59E0B',
                }
            },
            fontFamily: {
                sans: ['"Inter"', '"Segoe UI"', 'Roboto', 'sans-serif'],
                display: ['"Montserrat"', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(75, 54, 33, 0.1), 0 2px 4px -1px rgba(75, 54, 33, 0.06)',
                'floating': '0 10px 15px -3px rgba(22, 163, 74, 0.2), 0 4px 6px -2px rgba(22, 163, 74, 0.1)',
            },
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
