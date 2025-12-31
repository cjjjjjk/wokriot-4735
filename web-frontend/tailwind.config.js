/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            borderRadius: {
                'neu': '8px',
                'neu-lg': '12px',
                'neu-xl': '16px',
            },
            colors: {
                'neu-light-bg': '#e0e5ec',
                'neu-light-surface': '#e0e5ec',
                'neu-light-text': '#2c3e50',
                'neu-light-shadow': '#a3b1c6',
                'neu-light-highlight': '#ffffff',
                'neu-dark-bg': '#181b21',
                'neu-dark-surface': '#21252b',
                'neu-dark-text': '#ffffff', // High contrast text
                'neu-dark-shadow': '#0e1114',
                'neu-dark-highlight': '#363c45',
                primary: {
                    50: '#fef3e2',
                    100: '#fde7c5',
                    200: '#fbcf8b',
                    300: '#f9b751',
                    400: '#f79f17',
                    500: '#f58700',
                    600: '#c46d00',
                    700: '#935200',
                    800: '#623700',
                    900: '#311c00',
                }
            },
            boxShadow: {
                'neu-sm': '1px 1px 2px #b8c6db, -1px -1px 2px #ffffff',
                'neu-md': '3px 3px 6px #b8c6db, -3px -3px 6px #ffffff',
                'neu-lg': '5px 5px 10px #b8c6db, -5px -5px 10px #ffffff',
                'neu-xl': '8px 8px 16px #b8c6db, -8px -8px 16px #ffffff',
                'neu-inset': 'inset 1px 1px 2px #b8c6db, inset -1px -1px 2px #ffffff',
                'neu-dark-sm': '1px 1px 2px rgba(0,0,0,0.6), -1px -1px 2px rgba(255,255,255,0.03)',
                'neu-dark-md': '3px 3px 6px rgba(0,0,0,0.6), -3px -3px 6px rgba(255,255,255,0.03)',
                'neu-dark-lg': '5px 5px 10px rgba(0,0,0,0.6), -5px -5px 10px rgba(255,255,255,0.03)',
                'neu-dark-xl': '8px 8px 16px rgba(0,0,0,0.6), -8px -8px 16px rgba(255,255,255,0.03)',
                'neu-dark-inset': 'inset 1px 1px 2px rgba(0,0,0,0.6), inset -1px -1px 2px rgba(255,255,255,0.03)',
                'neu-dark-inset-lg': 'inset 2px 2px 4px rgba(0,0,0,0.6), inset -2px -2px 4px rgba(255,255,255,0.03)',
            },
        },
    },
    plugins: [],
}
