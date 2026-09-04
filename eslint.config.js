import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Infraestructura del CMS: exportan a la vez componentes y hooks/funciones.
    // La regla solo protege el «fast refresh» del servidor de desarrollo; ahí
    // un cambio en estos archivos recarga la página entera, y está bien.
    files: ['src/cms/**/*.{ts,tsx}', 'src/admin/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // El panel pide sus datos al servidor al montarse (contenido, biblioteca,
    // mensajes, historial) y apaga el indicador de carga al terminar. La regla
    // desaconseja tocar el estado dentro de un efecto y propone delegar en una
    // librería de datos; aquí no hay ninguna, y montar una para cuatro
    // pantallas detrás de una contraseña sería más código del que ahorra.
    files: ['src/admin/**/*.{ts,tsx}'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
])
