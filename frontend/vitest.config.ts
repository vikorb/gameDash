import { fileURLToPath } from 'node:url'

import type { ConfigEnv, UserConfig } from 'vite'
import { configDefaults, defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default defineConfig(async () => {
  const configEnv: ConfigEnv = {
    command: 'serve',
    mode: 'test',
    isPreview: false,
    isSsrBuild: false,
  }

  const baseViteConfig = (
    typeof viteConfig === 'function' ? await viteConfig(configEnv) : await viteConfig
  ) as UserConfig

  const vitestConfig = defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),

      pool: 'forks',
      maxWorkers: 1,
      fileParallelism: false,

      setupFiles: ['./tests/setup.ts'],
      clearMocks: true,
      restoreMocks: true,
      unstubGlobals: true,
    },
  }) as UserConfig

  return mergeConfig(baseViteConfig, vitestConfig)
})
