/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          'lime-cream': '#D9ED92',
          'light-green': '#B5E48C',
          'light-green-2': '#99D98C',
          'emerald': '#76C893',
          'ocean-mist': '#52B69A',
          'tropical-teal': '#34A0A4',
          'bondi-blue': '#168AAD',
          'cerulean': '#1A759F',
          'baltic-blue': '#1E6091',
          'yale-blue': '#184E77',
        },
        app: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          'text-primary': '#184E77',
          'text-secondary': '#475569',
          'text-muted': '#94A3B8',
        },
        status: {
          vencido: {
            bg: '#FEE2E2',
            text: '#B91C1C',
            border: '#B91C1C',
          },
          hoje: {
            bg: '#FFEDD5',
            text: '#C2410C',
            border: '#C2410C',
          },
          proximo: {
            bg: '#FEF3C7',
            text: '#B45309',
            border: '#B45309',
          },
          monitoramento: {
            bg: '#E0F2FE',
            text: '#168AAD',
            border: '#168AAD',
          },
          noprazo: {
            bg: '#DCFCE7',
            text: '#166534',
            border: '#166534',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(24, 78, 119, 0.08)',
        popover: '0 8px 24px rgba(24, 78, 119, 0.16)',
      }
    },
  },
  plugins: [],
}
