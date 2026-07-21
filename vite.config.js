import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Serve the root-level assets/ folder at /assets/... during dev
// (Vite's publicDir defaults to ./public which doesn't exist in this project)
function serveRootAssetsPlugin() {
  const assetsDir = path.resolve(__dirname, 'assets')
  const mimes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png',  '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
  }
  return {
    name: 'serve-root-assets',
    configureServer(server) {
      server.middlewares.use('/assets', (req, res, next) => {
        const urlPath = req.url.split('?')[0]
        const filePath = path.join(assetsDir, urlPath)
        console.log(`[AssetsMiddleware] Request: ${req.url} -> Resolved: ${filePath}`)
        
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase()
          res.setHeader('Content-Type', mimes[ext] || 'application/octet-stream')
          res.setHeader('Cache-Control', 'public, max-age=31536000')
          fs.createReadStream(filePath).pipe(res)
        } else {
          console.warn(`[AssetsMiddleware] File not found: ${filePath}`)
          next()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), serveRootAssetsPlugin()],
  build: {
    outDir: 'dist',
  }
})

