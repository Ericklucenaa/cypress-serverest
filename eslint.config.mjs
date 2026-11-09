import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import pluginCypress from 'eslint-plugin-cypress'

export default defineConfig([
  {
    ignores: [
      'node_modules/',
      'cypress/reports/',
      'cypress/screenshots/',
      'cypress/videos/',
      'cypress/downloads/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginCypress.configs.recommended,
  {
    rules: {
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/unsafe-to-chain-command': 'error',
    },
  },
])
