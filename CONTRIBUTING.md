# 贡献指南

感谢关注「喵班」！无论是提 Issue、改 Bug 还是加新功能，都欢迎。本文帮助你快速搭起开发环境并遵守项目规范。

## 🛠 环境搭建

```bash
# 1. 克隆并安装依赖（Node.js ≥ 18）
git clone https://github.com/Captainlidong/Class_Management_System_Mobile.git
cd Class_Management_System_Mobile
npm install        # 国内网络可加 --registry=https://registry.npmmirror.com

# 2. 启动后端（二选一）
#    a. 按后端仓库 README 启动完整服务：https://github.com/Captainlidong/mimo_Class_Management_System
#    b. 或任何已在 8080 端口运行的同款后端

# 3. 启动移动端 dev server
npm run dev:h5     # http://127.0.0.1:5174/m/
```

> `dev:h5` 已把 `/api` 代理到 `127.0.0.1:8080`。如果你的后端不在 8080，改 `vite.config.js` 里两处 proxy target（改 Origin 头一起改，否则后端 CORS 会拒，见 ARCHITECTURE §6.2）。

建议用浏览器 F12 固定 **390×844** 视口开发调试（iPhone 12/13/14 尺寸）。

## 🔀 开发工作流

1. 从 `main` 拉出功能分支：`git checkout -b feat/xxx`（或 `fix/xxx`）
2. 开发并自测（见下方验证清单）
3. 提交 PR 到 `main`，描述里写清楚：改了什么 / 为什么 / 自测截图（UI 改动必备）

### 提交信息规范（Conventional Commits）

| 前缀 | 用途 | 示例 |
|---|---|---|
| `feat` | 新功能 | `feat: todo module with urgency badges` |
| `fix` | 修复 | `fix: restore app web-view shell branch` |
| `ui` | 视觉/交互调整（不改逻辑） | `ui: full redesign to cream x forest-green` |
| `ux` | 交互体验优化 | `ux: polished login-to-home transition` |
| `docs` | 文档 | `docs: add architecture guide` |
| `build` | 构建/依赖/版本 | `build: pin uni compiler to 5.26 release` |
| `refactor` | 重构（不改行为） | `refactor: externalize server url to env config` |
| `chore` | 杂项 | `chore: bump versionCode 104` |

提交信息可用中文或英文，一行说清"做什么+为什么"。

## 📐 代码规范

### 主题与颜色

- **页面样式禁止硬编码色值**，一律引用 `src/uni.scss` 设计令牌（`$cream-bg`、`$primary`、`$berry`…）
- 需要新颜色时先在 `uni.scss` 加令牌再使用，令牌命名用"物质隐喻"（matcha/peach/butter/taro），不用 red/blue
- 尺寸单位用 `rpx`（750 设计稿基准）

### 图标（AppIcon.vue）

- 新增图标：在 `AppIcon.vue` 的 path 表里加条目即可，遵守——单 path、24 viewBox、stroke 1.8、`currentColor`
- 禁止 emoji 当图标、禁止引入第三方图标库（保持视觉统一）

### 插画（cats 家族）

- 风格约束：大圆头短身体三花猫、深绿椭圆眼带高光、橙/灰斑、腮红、薄荷项圈金铃铛；线性 SVG，无渐变无位图
- 新增场景猫请复用现有部件（眼睛/项圈/腮红），保持家族脸型一致

### 层级（z-index）

- 自绘弹层/浮层一律 **≤ 998**（`uni.showModal` 固定 999，被盖住会"点击无反应"）
- 全屏过场层可高于 TabBar，但不得使用 uni-modal 的场景除外

### 条件编译

- H5 / APP-PLUS 差异代码必须包 `#ifdef` 并注释原因
- APP 壳分支（`pages/index/index.vue` 的 `#ifdef APP-PLUS`）**不可删除**——它是 APK 的核心，删了 APK 会打开成原生页
- 生产服务器地址只从 `src/config/server.js` 引入（`VITE_PROD_SERVER`），禁止硬编码任何真实地址

### API 调用

- 页面不直接调 `uni.request`，一律通过 `src/api/`（统一 401 拦截、响应包解包、错误 toast）
- 新接口先在 `api/index.js` 加语义化函数，再在 `docs/API.md` 补文档

## ✅ 提交前验证清单

- [ ] `npm run dev:h5` + 390×844 视口全流程回归：登录 → 欢迎过场 → 首页 → 收集任务详情（勾选/备注/批量） → 请假登记/销假 → 待办增删改 → 筛查/历史 → 退出登录
- [ ] 会话过期路径正常：清 Cookie 后任意操作 → toast + 跳登录页
- [ ] `npm run build:h5` 与 `npm run build:app` 均构建通过
- [ ] 控制台无报错；空态（无数据模块）显示正常
- [ ] 新颜色走了令牌、新图标进了 AppIcon、新接口进了 API 文档

## 🐛 报告 Issue

提交 Bug 请附上：

1. 环境：H5（浏览器+视口）还是 APP（版本）？
2. 复现步骤（步骤 → 期望 → 实际）
3. 截图或录屏（UI 问题必备）
4. 控制台报错（F12 Console / HBuilderX 打包日志）

功能建议请说明使用场景（班长日常的哪个痛点），比直接给方案更有价值。

## 💬 行为准则

保持友善、对新手耐心；讨论对事不对人。项目维护者保留对 Roadmap 的最终取舍权——班级场景的真实需求永远优先于技术炫技。
