import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return isProduction ? {
    plugins: [ svelte(),
      {
        name: 'copy-assets',
        apply: 'build',
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'icon.png',
            source: require('fs').readFileSync('icon.png'),
          });
        },
      },
    ],
    build: {
      lib: {
        entry: 'src/applet-index.ts',
        name: 'applet',
        fileName: (_format) => `index.js`,
        formats: ['es'],
      }
    },
  } : {}
})
