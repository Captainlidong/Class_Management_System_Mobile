# 班级管理助手 · 移动端（uni-app H5）

班级成员管理系统的移动端，基于 **uni-app + Vue3 + Vite**，部署为 H5 网页版，挂载在服务器 `/m/` 子路径。后端复用桌面版同一个 Java 服务（`/api`），**同源 Cookie 登录，与桌面版会话互通**。

> 原桌面版项目（`D:\CS\projectDeployment\Class_Management_System`）零改动；本工程完全独立。

## 功能（v1）

- 登录（账号 + 密码 + 图形验证码）
- 首页汇总：收集任务进度、请假动态、快捷入口
- 资料收集与分发：任务列表 / 详情（点击切换状态、行内备注、一键标记全部、批量移除、复制未交名单、导出 xlsx）、新建任务
- 请假记录：筛选、登记、编辑、销假、删除
- 奖学金统计：批次列表、交表状态切换
- 更多：基准名单（只读）、群发素材（含拍照上传附件）、名单筛查、筛查历史、退出登录

## 本地开发

```bash
# 1. 启动后端（部署副本 jar，严格模式；或任意已运行的后端 8080）
cd D:\CS\projectDeployment\Class_Management_System\backend
"D:\CS\Javajdk\bin\java" -Xms128m -Xmx512m -jar target/class-member-backend-1.0.0.jar ^
  --app.access-username=captainDong --app.access-password=你的密码

# 2. 启动移动端 dev server（端口 5174，/api 自动代理到 127.0.0.1:8080）
cd D:\CS\classMgmtUniappMobile
npm run dev:h5
# 浏览器访问 http://127.0.0.1:5174/m/（建议 F12 切手机视口）
```

**HBuilderX 也可以用**：菜单「文件 → 打开目录」选择本工程即可当编辑器；运行菜单会走 npm 脚本（本工程是 npm/Vite 形态的 uni-app 项目）。

## 构建 & 部署上线

```bash
npm run build:h5     # 产物：dist/build/h5/
```

服务器（腾讯云 your-server-ip / 宝塔）：

1. 上传 `dist/build/h5/` 里的**内容**到 `/www/wwwroot/class-mgmt/mobile/`
2. 编辑现有反代站点 conf（`java_class_mgmt.conf`），在 `server { }` 里、反代 location 之前加：

   ```nginx
   location /m/ {
       alias /www/wwwroot/class-mgmt/mobile/;
       index index.html;
       try_files $uri $uri/ /m/index.html;
   }
   ```

3. `nginx -s reload`
4. 手机浏览器访问 `http://your-server-ip/m/`，账号密码与桌面版一致；可「添加到主屏幕」当 App 用

> 无需改后端、无需执行 SQL。生产同源无 CORS 问题。

## 关键技术点（排障备忘）

- **代理 Origin 重写**：dev 代理必须把 `Origin` 改写成目标地址（见 `vite.config.js` 的 `headers`），否则后端 CORS 校验会拒绝 5174 来源（生产同源无此问题）
- **登录会话**：`CMS_SESSION` HttpOnly Cookie，7 天滑动过期；token 只在 Set-Cookie 头里。若日后打 APK，可在 `api/request.js` 加 `X-Auth-Token` 分支（后端已支持该头）
- **uni-modal 层级**：uni.showModal 默认 z-index 999，自绘弹层要低于它（本项目弹层 998）
- 依赖版本锁：`@dcloudio/*` = `3.0.0-alpha-5020720260921001`（与 HBuilderX 5.34 内置编译器同版），vue 3.4.21 / vite 5.2.8 / sass 1.77.8
