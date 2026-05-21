import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/main.ts', 'vite.config.ts', 'eslint.config.ts', 'cypress.config.ts'],
  project: ['src/**/*.{ts,tsx,vue,css}', 'cypress/**/*.{ts,tsx}', '*.config.{ts,mts,cjs,js}'],
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
}

export default config
