import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Dev-only: proxies to local backend over plain HTTP (localhost only).
        // Production must serve over HTTPS — never deploy this config as-is.
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
