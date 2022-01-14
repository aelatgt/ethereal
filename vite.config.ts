
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    conditions: ['source'],
    mainFields: ['module','main'],
    alias: {
      "ethereal": "ethereal/ethereal"
    }
  },
  server: {
    // hmr: {
    //   port: 443
    // },
    host: true,
    https: true
  },
  optimizeDeps: {
    exclude: ['@loaders.gl/worker-utils']
  },
  build: {
    outDir: "docs",
    rollupOptions: {
      input: {
        // main: resolve(__dirname, 'index.html'),
        card: resolve(__dirname, 'apps/hubs-demo/Card.vue'),
        demo: resolve(__dirname, 'apps/demo/index.html'),
        pride: resolve(__dirname, 'apps/pride/index.html'),
        "web-layer": resolve(__dirname, 'apps/web-layer/index.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js'
      }
    }
  },
  plugins: [vue({})]
})