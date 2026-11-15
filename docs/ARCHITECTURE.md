# 架构设计文档

> 本文描述「喵班」移动端的整体架构、关键技术决策与工程经验。适合首次接触本项目的开发者阅读。
> 接口清单见 [API.md](API.md)，参与开发前请同时阅读 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 1. 总体架构

```
┌──────────────────────────────────────────────────────────────┐
│                     服务器（Nginx + Spring Boot）              │
│                                                              │
│   浏览器/APK ──►  Nginx                                       │
│                    ├── /m/   静态托管 uni-app 构建产物（H5）    │
│                    └── /api  反代 ──► Spring Boot :8080       │
│                                            └──► MySQL        │
└──────────────────────────────────────────────────────────────┘
        ▲                                  ▲
        │ 同源 Cookie（CMS_SESSION）        │ 同源 Cookie
   手机浏览器（H5）                    Android APP
   uni-app H5 构建                  uni-app APP-PLUS 构建
                                    = web-view 壳，加载 /m/
```

三端（桌面 Web / 移动 H5 / APP）共用同一个后端与同一套会话体系；本仓库只包含移动端工程。

## 2. 关键决策记录（ADR）

### ADR-1 · 工程形态：npm/Vite，而非 HBuilderX 原生工程

uni-app 有两种工程形态。选择 **npm/Vite 形态**（`@dcloudio/vite-plugin-uni`）：

- ✅ 与主流前端工具链一致（`npm run dev:h5 / build:h5 / build:app`），可用任意编辑器
- ✅ vite.config.js 可自由定制（开发代理、Origin 重写）
- ⚠️ 代价：云打包时编译器版本必须与云端 SDK 对齐（见 §6.4）

### ADR-2 · H5 优先，APP 只是壳

核心洞察：班级系统的用户永远在线（收资料的场景天然联网），**没有离线需求**。

- H5 承载全部业务逻辑，部署在服务器 `/m/` 子路径
- Android APP = web-view 壳，启动即加载服务器 H5
- **收益：H5 更新即 APP 更新，永远不需要为了业务改动重新打包 APK**（仅壳本身变化才需要）
- 代价：强依赖网络；首次启动受服务器可用性影响

### ADR-3 · 同源 Cookie 认证，而非 token

- H5 与后端同域部署 → Cookie 天然同源自动携带，无 CSRF 域问题、无 token 存储问题
- 与桌面版**共享同一会话**（`CMS_SESSION` HttpOnly Cookie，7 天滑动过期）：桌面登录过，移动端直接进入
- 后端的 `AccessPasswordFilter` 同时兼容 `X-Auth-Token` 头，为未来独立 App 留了退路（当前未使用）
- APP 壳内加载的就是同源 H5 页面，认证路径与浏览器完全一致

### ADR-4 · 自绘 TabBar / 弹层，而非内置组件

- 自绘 TabBar（CSS + AppIcon 图标）而非 uni-app tabBar 配置：可做激活态药丸动效、猫插画头像等定制
- 自绘弹层 z-index 统一 **998**：必须低于 `uni.showModal` 的 999，否则原生弹窗被盖住无法点击（见 §6.3）

## 3. 代码分层

```
pages（15 个视图页，Option API）
  │  只做视图编排与交互
  ▼
api/index.js（接口清单，函数语义命名）──► api/request.js（统一封装）
  │                                        │ 401 → onUnauthorized（跳登录）
  ▼                                        │ code===0 才 resolve(body.data)
stores/auth.js（Pinia：登录态/账号）         │ 否则 toast(body.message)
  │                                        ▼
  └──────────────────────────────► 后端 /api
```

- **`request.js` 是唯一的网络出口**：统一响应包解包（`{code, message, data}`，`code===0` 且 HTTP 2xx 才算成功）、401 全局拦截、错误 toast、multipart 上传、H5 同源下载
- 页面不直接调 `uni.request`，保证认证与错误处理全局一致

## 4. 条件编译：一套代码，双形态

单一代码库通过 uni-app 条件编译适配两种形态：

```
src/pages/index/index.vue
├── #ifndef APP-PLUS   → 浏览器/手机 H5：完整首页视图（汇总卡、待办提醒、欢迎过场）
└── #ifdef APP-PLUS    → APK：仅一个 <web-view :src="APP_ENTRY_URL">
                          + onBackPress（返回键映射网页 history 后退）
```

规则（贡献者必读）：

- 平台差异代码**必须**包在 `#ifdef` 中并注释原因；禁止无注释的平台分支
- APP 壳的 `onLaunch` 不做任何 `/api` 请求（壳内无域名基准，必然失败）——认证由壳内 H5 自己完成
- 服务器地址只允许从 `src/config/server.js` 引入（`VITE_PROD_SERVER` 环境变量），禁止硬编码

## 5. 主题与设计系统

### 5.1 设计令牌（`uni.scss`）

全局唯一的颜色事实源。页面样式**禁止硬编码色值**，一律引用令牌（色板表见 [README](../README.md#色板-uniscss-设计令牌)）。

主题换肤的实现方式即"换令牌值"：v1.1.0 从 iOS 奶油马卡龙风格迁移到「喵班」奶油×深林绿风格，只改了 `uni.scss` + 少量硬编码色清扫，页面结构零改动。

### 5.2 图标体系（`AppIcon.vue`）

- 单文件组件内置 30+ 图标的 SVG path 表，`<AppIcon name="todo" :size="20" />` 即用
- 约束：单 path、24 viewBox、stroke 1.8、`stroke="currentColor"`（继承文字色）
- 新增图标只加 path 条目，不改组件结构

### 5.3 插画家族（`components/cats/`）

手绘三花猫风格约束：大圆头短身体、深绿椭圆眼带高光、橙/灰斑、腮红、薄荷项圈金铃铛；全部为线性 SVG（无渐变、无位图）。现有 CatSitting（主视觉）/ CatWave（欢迎）/ CatSleep（空态）/ CatWork（工作中）+ SpeechBubble（语气泡）。

## 6. 工程经验与踩坑记录（最有价值的部分）

> 以下是开发中真实踩过的坑，后来者请直接绕行。

### 6.1 vite 插件缺一不可

`vite.config.js` 忘写 `plugins: [uni()]` 时，dev server 正常启动但 **所有 .vue 组件不被编译**，页面空白且无报错。新建工程后第一个检查项。

### 6.2 开发代理必须重写 Origin

后端 CORS 校验会拒绝开发端（5174）来源，报 `Invalid CORS request`。`vite.config.js` 的代理必须同时重写 Host 和 Origin：

```js
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
    headers: { Origin: 'http://127.0.0.1:8080' }   // 关键
  }
}
```

生产同源部署无此问题。

### 6.3 层级规范：自绘弹层一律 ≤998

`uni.showModal` 的 z-index 固定 999。自绘弹层（底部弹窗、下拉面板）必须低于它，本项目统一 998。否则确认弹窗被自己的面板盖住，看起来像"点击无反应"。

### 6.4 编译器版本必须与云打包 SDK 对齐

npm 形态的 `@dcloudio/*` 若使用 alpha 版（超前于 DCloud 云端最新打包 SDK），云打包直接报"无法正常打包"。解法：全部锁到与云端 SDK 对应的**正式版**：

```
@dcloudio/* = 3.0.0-5020620260917001    （对应 HBuilderX 5.26 线）
```

另：`npm pkg set` 写入 dependencies 时，若 devDependencies 残留同名旧版本，**devDependencies 优先生效**——降版本后务必检查两段依赖表。

### 6.5 `<button>` 编译为 `<uni-button>`

uni-app H5 端的 `<button>` 编译成自定义元素 `<uni-button>`。E2E 自动化/浏览器 JS 选择器要写 `uni-button` 而不是 `button`；同理验证码图片在 `<uni-image>` 的内层 div 的 background-image 里，不是 `<img src>`。

### 6.6 fixed 元素的 offsetParent 为 null

uni-app H5 中 fixed 定位元素的 `offsetParent` 是 null，自动化判断元素可见性不能用常规的 offset 链，用 `getComputedStyle(el).display` 判断。

### 6.7 vite dev 的文件监听在 Windows 上偶发失灵

源码已改对但 dev server 仍吐旧模块（curl `http://127.0.0.1:5174/m/src/pages/xxx.vue?import` 可验证吐出的内容）。解法：干净重启 dev server，不要原地热更硬刚。

### 6.8 生产服务器地址走环境变量

APP 壳地址在 `src/config/server.js` 读取 `VITE_PROD_SERVER`（构建时注入），占位符兜底；真实值放 `.env.local`（gitignore）。开源仓库不带任何真实部署信息。

## 7. 登录 → 首页时序（欢迎过场机制）

```
登录页                          首页
──────                          ──────
submit()
  ├─ btnState=submitting（脉冲）
  ├─ auth.login() 成功
  ├─ btnState=success「✓ 喵！欢迎回来」460ms
  ├─ setStorageSync('miaoban_welcome', {name, ts})
  ├─ 登录页 fading（opacity 0, 240ms）
  └─ uni.reLaunch('/pages/index/index')
                                onShow()
                                  ├─ 读到 welcome 标志 → welcomeOverlay=true
                                  ├─ 并行 load()（数据在过场背后加载）
                                  ├─ 最短展示 1300ms → overlayFade=true（480ms）
                                  ├─ entered=true → 卡片依次上浮（d0-d4，0~360ms）
                                  └─ removeStorageSync（Tab 切换/刷新不重播）
```

设计意图：**数据在过场背后加载完毕，揭开即完整状态**——消除"骨架先空、数据到了突变填充"的生硬感。

## 8. 安全模型

- 移动端**不存储任何凭据**：无 token、无密码持久化，认证完全依赖 HttpOnly Cookie（JS 不可读）
- 图形验证码、登录失败锁定（15 分钟 5 次错密码锁 IP）均由后端实现，前端只管展示与跳转
- 401 统一拦截：任何接口返回 401 → toast + 跳登录页，页面本身不做权限判断
- 上传走后端 50MB 单文件 / 200MB 单请求限制；附件与后端同源存储
