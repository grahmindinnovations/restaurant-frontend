import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendPort = process.env.VITE_BACKEND_PORT || process.env.BACKEND_PORT || 5180
const backendHost = process.env.VITE_BACKEND_HOST || process.env.BACKEND_HOST || '127.0.0.1'
const backendTarget = `http://${backendHost}:${backendPort}`

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-macros'],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        timeout: 30000,
        proxyTimeout: 30000,
      },
      '/socket.io': {
        target: backendTarget,
        ws: true,
        changeOrigin: true,
        timeout: 30000,
        proxyTimeout: 30000,
      },
    },
  },
})
