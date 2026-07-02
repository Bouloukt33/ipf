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
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // TODO(dette): 43 `any` hérités dans services/hooks — à typer
      // progressivement (interdit dans le nouveau code, voir .claude/skills).
      '@typescript-eslint/no-explicit-any': 'warn',
      // TODO(dette): hooks de fetch avec setState dans useEffect — à migrer
      // vers TanStack Query. Nouvelle règle stricte de react-hooks v7.
      'react-hooks/set-state-in-effect': 'warn',
      'react-refresh/only-export-components': 'warn',
    },
  },
])
