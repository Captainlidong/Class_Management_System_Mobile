import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import uni from '@dcloudio/vite-plugin-uni'

// 版本号从 manifest.json 注入为全局常量 __APP_VERSION__（更多页「关于」展示用），
// 避免页面硬编码版本号与 manifest 脱节
const manifest = JSON.parse(readFileSync('./src/manifest.json', 'utf8'))

// 本地开发：/api 代理到本机后端（严格模式 jar / mvn spring-boot:run）
// changeOrigin 重写 Host；headers 同步重写 Origin，避免后端 CORS 校验把
// 开发端 5174 来源拒掉（生产同源无此问题）
// 生产部署：H5 包放到服务器 Nginx /m/ 静态目录，/api 由现有反代承接，天然同源
export default defineConfig({
  plugins: [uni()],
  define: {
    __APP_VERSION__: JSON.stringify(manifest.versionName)
  },
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
  },
  // 本地验证构建产物：npm run build:h5 后 vite preview（同源代理 /api）
  preview: {
    host: '127.0.0.1',
    port: 5199,
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
