import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// 本地开发：/api 代理到本机后端（严格模式 jar / mvn spring-boot:run）
// changeOrigin 重写 Host；headers 同步重写 Origin，避免后端 CORS 校验把
// 开发端 5174 来源拒掉（生产同源无此问题）
// 生产部署：H5 包放到服务器 Nginx /m/ 静态目录，/api 由现有反代承接，天然同源
export default defineConfig({
  plugins: [uni()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        headers: {
          Origin: 'http://127.0.0.1:8080'
        }
      }
    }
  }
})
