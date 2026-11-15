/**
 * 生产服务器地址 —— 仅 APK（APP-PLUS）web-view 壳使用。
 *
 * 开源仓库默认使用占位符；本地真实值写在 .env.local（已被 .gitignore 忽略）：
 *   VITE_PROD_SERVER=http://your-server-ip
 * 复制 .env.example 为 .env.local 填入自己的服务器地址即可。
 */
export const PROD_SERVER = import.meta.env.VITE_PROD_SERVER || 'http://your-server-ip'

/** APK 壳加载的 H5 入口（H5 部署在服务器 /m/ 子路径） */
export const APP_ENTRY_URL = `${PROD_SERVER}/m/`
