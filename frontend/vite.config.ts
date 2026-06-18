import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'

export default defineConfig(() => {
  const isVitest = process.env.VITEST === 'true'

  return {
    plugins: [
      vue(),
      // Avoid spawning checker workers during test runs: it can cause high memory use on Windows.
      !isVitest &&
        checker({
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint .',
            useFlatConfig: true,
            watchPath: './src',
          },
        }),
    ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://gamedash_back:3000',
        changeOrigin: true,
        secure: false,
      },
      '/pb': {
        target: process.env.POCKETBASE_URL || 'http://gamedash_pocketbase:8090',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/pb/, ''),
      },
    },
    watch: {
      usePolling: true,
    },
  },
  }
})
