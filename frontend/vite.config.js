import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Google Maps key: prefers VITE_GOOGLE_MAPS_API_KEY, falls back to the project
// key so the site keeps working if the env var is not set at build time.
const FALLBACK_GOOGLE_MAPS_KEY = 'AIzaSyDXVfx1YGENdQhxfAfDOGiYzFJ8QHbQ5Ec'

const googleMapsKeyPlugin = (env) => ({
  name: 'inject-google-maps-key',
  transformIndexHtml(html) {
    const key = env.VITE_GOOGLE_MAPS_API_KEY || FALLBACK_GOOGLE_MAPS_KEY
    return html.replace(/__GOOGLE_MAPS_API_KEY__/g, key)
  }
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react(), googleMapsKeyPlugin(env)],
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            // Keep React and its ecosystem together to avoid circular chunks.
            if (/node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/.test(id)) return 'react'
            if (id.includes('/three/') || id.includes('\\three\\')) return 'three'
            if (id.includes('leaflet')) return 'maps'
            if (id.includes('socket.io') || id.includes('engine.io')) return 'socket'
            return 'vendor'
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && !res.headersSent && typeof res.writeHead === 'function') {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Backend service offline or booting.' }));
              }
            });
          }
        },
        '/socket.io': {
          target: 'http://127.0.0.1:5000',
          ws: true,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', () => {
              // Backend not up yet — the socket client retries on its own.
            });
            proxy.on('proxyReqWs', (_proxyReq, _req, socket) => {
              socket.on('error', () => {
                // Silently handle websocket client drop
              });
            });
          }
        }
      }
    }
  }
})
