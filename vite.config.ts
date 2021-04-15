
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    conditions: ['source'],
    mainFields: ['module','main']
  },
  build: {
    outDir: "docs",
    rollupOptions: {
      input: {
        // main: resolve(__dirname, 'index.html'),
        demo: resolve(__dirname, 'apps/demo/index.html'),
        pride: resolve(__dirname, 'apps/pride/index.html'),
        "web-layer": resolve(__dirname, 'apps/web-layer/index.html')
      }
    }
  },
  plugins: [vue()]
})