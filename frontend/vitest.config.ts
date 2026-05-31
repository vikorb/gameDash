import { fileURLToPath } from 'node:url'

import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      pool: 'vmThreads',
      setupFiles: ['./tests/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
      unstubGlobals: true,
    },
  }),
)
