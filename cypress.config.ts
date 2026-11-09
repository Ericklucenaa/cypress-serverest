import { defineConfig } from 'cypress'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const registrarRelatorio = require('cypress-mochawesome-reporter/plugin')

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportPageTitle: 'ServeRest - Relatório de testes',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  e2e: {
    baseUrl: 'https://front.serverest.dev',
    // valores públicos (Cypress 16+): lidos nos testes com Cypress.expose('apiUrl')
    expose: {
      apiUrl: 'https://serverest.dev',
    },
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    retries: { runMode: 2, openMode: 0 },
    video: false,
    setupNodeEvents(on, config) {
      registrarRelatorio(on)
      return config
    },
  },
})
