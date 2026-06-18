import { fileURLToPath } from 'node:url'

import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

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

  return mergeConfig(
    baseViteConfig,
    defineConfig({
      test: {
        environment: 'jsdom',
        exclude: [...configDefaults.exclude, 'e2e/**'],
        root: fileURLToPath(new URL('./', import.meta.url)),
        // 'forks' au lieu de 'vmThreads' : chaque fichier de test tourne dans
        // un process isolé, les mocks de modules sont correctement réinitialisés
        // entre fichiers et ne polluent pas le cache des autres workers
        pool: 'forks',
        poolOptions: {
          forks: {
            maxForks: 1,
            minForks: 1,
          },
        },
        setupFiles: ['./tests/setup.ts'],
        clearMocks: true,
        restoreMocks: true,
        unstubGlobals: true,
      },
    }),
  )
})
