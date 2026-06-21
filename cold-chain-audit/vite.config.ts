import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('antd') || id.includes('@ant-design')) return 'antd-vendor';
            if (id.includes('echarts')) return 'echarts-vendor';
            if (id.includes('xlsx')) return 'xlsx-vendor';
            return 'vendor';
          }
        }
      }
    }
  }
})
