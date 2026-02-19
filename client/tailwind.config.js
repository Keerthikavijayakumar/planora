/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fff0f1',
                    100: '#fce4e6',
                    200: '#f2c4c8',
                    300: '#e8a0a6',
                    400: '#d4727a',
                    500: '#c45a63',
                    600: '#a84450',
                    700: '#8d3542',
                    800: '#762e3a',
                    900: '#642a35',
                }
            },
            fontFamily: {
                serif: ['Playfair Display', 'Georgia', 'serif'],
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
