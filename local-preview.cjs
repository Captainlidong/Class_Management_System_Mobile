/**
 * 本地验证服务器（零依赖）：静态托管 dist/build/h5 + /api 代理到本机后端
 * 用途：上线前验证构建产物。node local-preview.cjs → http://127.0.0.1:5199/m/
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const DIST = path.join(__dirname, 'dist', 'build', 'h5')
const BACKEND = 'http://127.0.0.1:8080'
const PORT = 5199

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
}

function proxy(req, res) {
  const headers = { ...req.headers }
  // 与 nginx changeOrigin 同理：Host/Origin 重写为后端，避免 CORS 误判
  headers.host = '127.0.0.1:8080'
  if (headers.origin) headers.origin = 'http://127.0.0.1:8080'
  const opts = {
    host: '127.0.0.1',
    port: 8080,
    path: req.url,
    method: req.method,
    headers
  }
  const preq = http.request(opts, (pres) => {
    res.writeHead(pres.statusCode, pres.headers)
    pres.pipe(res)
  })
  preq.on('error', () => {
    res.writeHead(502)
    res.end('proxy error')
  })
  req.pipe(preq)
}

function serveStatic(res, urlPath) {
  let rel = urlPath.replace(/^\/m\/?/, '')
  if (!rel || rel.endsWith('/')) rel += 'index.html'
  let file = path.join(DIST, rel)
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html') // SPA 回退
  }
  const ext = path.extname(file).toLowerCase()
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxy(req, res)
    return
  }
  if (req.url === '/m' || req.url.startsWith('/m/')) {
    serveStatic(res, req.url)
    return
  }
  res.writeHead(302, { Location: '/m/' })
  res.end()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`local preview: http://127.0.0.1:${PORT}/m/ (dist/build/h5 + api->8080)`)
})
