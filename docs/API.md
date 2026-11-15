# API 接口文档（移动端消费）

> 本文档覆盖「喵班」移动端实际调用的后端接口。全部接口由桌面端 + 后端仓库（[mimo_Class_Management_System](https://github.com/Captainlidong/mimo_Class_Management_System)）的 Spring Boot 服务提供；前端定义源：`src/api/index.js`。

## 通用约定

### 基地址与同源

- Base URL：`/api`（相对路径）。H5 与后端**同域部署**（Nginx 把 `/api` 反代到 Spring Boot），Cookie 自动携带，无 CORS 问题。
- 开发模式由 vite 代理 `/api → http://127.0.0.1:8080`（需重写 Origin，见 ARCHITECTURE §6.2）。

### 响应包

除下载类接口（直接返回字节流）外，所有接口返回统一包：

```json
{ "code": 0, "message": "ok", "data": ... }
```

- HTTP 2xx **且** `code === 0` 才视为成功，前端 `resolve(body.data)`
- 其余情况前端 toast `message` 并 reject

| code | 含义 |
|---|---|
| 0 | 成功 |
| 400 | 参数错误（如待办标题为空） |
| 401 | 未登录 / 会话过期 → 前端统一跳登录页 |
| 429 | 登录尝试过多，IP 已被临时锁定（15 分钟 5 次错密码） |
| 500 | 服务器内部错误 |

### 认证

- `CMS_SESSION` HttpOnly Cookie，7 天滑动过期；JS 不可读，前端无需（也无法）手动管理 token
- 后端兼容 `X-Auth-Token` 请求头（备用方案，移动端当前未使用）
- 所有业务接口需登录态；仅 `/api/health` 与 `/api/auth/*` 免认证

---

## 1. 认证 `/api/auth`

| 方法 | 路径 | 说明 | 关键参数 |
|---|---|---|---|
| GET | `/auth/status` | 登录态探测（首屏调用） | — |
| GET | `/auth/captcha` | 获取图形验证码（一次性，3 分钟有效） | — |
| POST | `/auth/login` | 登录 | `username, password, captchaId, captchaCode`（不区分大小写） |
| POST | `/auth/logout` | 退出登录（销毁会话） | — |

`GET /auth/captcha` 响应示例：

```json
{ "code": 0, "message": "ok", "data": { "captchaId": "a1b2c3...", "image": "data:image/png;base64,..." } }
```

`POST /auth/login` 请求示例：

```json
{ "username": "demo", "password": "••••", "captchaId": "a1b2c3...", "captchaCode": "x7k9" }
```

> 验证码一次性：登录失败后必须重新拉取再试。

## 2. 基准名单 `/api/students`

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/students` | 全量名单（id / 姓名 / 学号），供名单页与收集任务选人 |

## 3. 资料收集与分发 `/api/collections`

任务分两种口径：`kind = collect`（收集，"谁还没交"）/ `kind = distribute`（分发，"谁还没领"）。

| 方法 | 路径 | 说明 | 关键参数 |
|---|---|---|---|
| GET | `/collections/tasks` | 任务列表（含 total / received 汇总） | — |
| POST | `/collections/tasks` | 新建任务 | `title`、`kind`（collect / distribute）、参与学生集合 |
| GET | `/collections/tasks/{id}` | 任务详情 + 条目明细（received / receivedAt / remark） | — |
| PATCH | `/collections/tasks/{id}` | 更新任务（按传入键更新） | `title` 等 |
| DELETE | `/collections/tasks/{id}` | 删除任务 | — |
| PATCH | `/collections/entries/{id}` | 条目级更新（勾选状态、行内备注失焦保存） | `received`、`remark` 任意键 |
| POST | `/collections/tasks/{id}/students` | 添加参与学生 | `studentIds: []` |
| DELETE | `/collections/tasks/{id}/students/{studentId}` | 移除单个学生 | — |
| POST | `/collections/tasks/{id}/students/batch-remove` | 批量移除 | `studentIds: []` |
| POST | `/collections/tasks/{id}/mark` | 按姓名/学号文本标记提交/领取 | `text`、`submitted` |
| POST | `/collections/tasks/{id}/mark-all` | 一键标记全部已交/已领（对称开关） | `submitted` |
| GET | `/collections/tasks/{id}/export` | 导出名单（字节流下载） | `format=xlsx\|csv`、列选择等查询参数 |

## 4. 请假记录 `/api/leaves`

| 方法 | 路径 | 说明 | 关键参数 |
|---|---|---|---|
| GET | `/leaves` | 请假列表 | `studentId`、`status`、`type`、`from`、`to`（均可选） |
| GET | `/leaves/stats` | 请假统计（首页动态卡） | — |
| POST | `/leaves` | 登记请假 | — |
| PATCH | `/leaves/{id}` | 编辑请假 | — |
| POST | `/leaves/{id}/close` | 销假 | — |
| POST | `/leaves/{id}/reopen` | 重开（恢复未销假） | — |
| DELETE | `/leaves/{id}` | 删除 | — |
| GET | `/leaves/export` | 导出（字节流下载） | `format=xlsx\|csv` |

## 5. 奖学金统计 `/api/scholarships`

| 方法 | 路径 | 说明 | 关键参数 |
|---|---|---|---|
| GET | `/scholarships/batches` | 批次列表 | — |
| GET | `/scholarships/batches/{id}` | 批次详情 + 获奖人明细 | — |
| PATCH | `/scholarships/awards/{id}` | 更新获奖条目 | 按传入键 |
| POST | `/scholarships/awards/{id}/mark-received` | 标记交表/领款状态 | `received`（bool） |

> 桌面端另有批次创建 / Excel 导入解析等接口（`POST /batches`、`POST /batches/{id}/import/parse`），移动端暂未使用。

## 6. 群发素材 `/api/announcements`

| 方法 | 路径 | 说明 | 关键参数 |
|---|---|---|---|
| GET | `/announcements` | 素材列表 | `q`、`category`、`status`（均可选） |
| GET | `/announcements/{id}` | 素材详情（含版本与附件） | — |
| POST | `/announcements/{id}/files` | **上传附件**（multipart，移动端拍照上传） | 表单字段名 `files` |
| GET | `/announcements/{id}/files/{fileId}` | 附件下载（字节流） | — |
| DELETE | `/announcements/{id}/files/{fileId}` | 删除附件 | — |
| POST | `/announcements/{id}/mark-sent` | 标记已发 | — |
| POST | `/announcements/{id}/unmark-sent` | 取消已发标记 | — |
| DELETE | `/announcements/{id}` | 删除素材 | — |

## 7. 待办事务 `/api/todos`

排序规则（服务端返回即有序）：**未完成**（`dueAt` 升序，无截止日期排最后）→ **已完成**（完成时间倒序）。条目含服务端计算的 `overdue`（逾期）与 `dueToday`（今日到期）标记。

| 方法 | 路径 | 说明 | 关键参数 |
|---|---|---|---|
| GET | `/todos` | 待办列表（含未完成计数） | — |
| POST | `/todos` | 新建 | `title`（必填，≤128）、`detail`（≤512）、`dueAt`（可选，ISO 8601） |
| PATCH | `/todos/{id}` | 更新（按传入键） | `title`、`detail`、`dueAt`、`done`（勾选自动维护 doneAt） |
| DELETE | `/todos/{id}` | 删除 | — |

请求示例：

```json
{ "title": "收四六级报名表", "detail": "结课前一周收齐", "dueAt": "2026-11-20T23:59:00Z" }
```

## 8. 名单筛查 `/api/check`、`/api/check-records`

截图 OCR 识别由**后端**完成（Windows OCR 优先，Tesseract 回退）；移动端只提交与展示。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/check` | 执行名单比对（提交名单文本，返回识别/比对结果） |
| GET | `/check-records` | 筛查历史列表 |
| GET | `/check-records/{id}` | 历史详情 |
| DELETE | `/check-records/{id}` | 删除历史 |

## 9. 下载类接口的处理

导出与附件下载是字节流响应（非统一响应包），前端用同源直接跳转下载（Cookie 自动携带）：

```js
// src/api/request.js
export function downloadByUrl(urlAndQuery) {
  window.location.href = '/api' + urlAndQuery   // #ifdef H5
}
```

## 10. 健康检查

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 免认证；返回服务状态与数据库连通性，可用作部署后的冒烟检查 |
