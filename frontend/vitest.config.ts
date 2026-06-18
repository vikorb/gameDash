import { fileURLToPath } from 'node:url'

import { configDefaults, defineConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default defineConfig(async () => {
  const baseViteConfig =
    typeof viteConfig === 'function'
      ? await viteConfig({
          command: 'serve',
          mode: 'test',
          isPreview: false,
          isSsrBuild: false,
        })
      : viteConfig

  return {
    ...baseViteConfig,
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      pool: 'forks',
      setupFiles: ['./tests/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
      unstubGlobals: true,
    },
  }
})
