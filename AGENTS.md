# AGENTS.md — 个人主页项目

## 项目概述
基于 **Vue 3 + Express + SQLite** 的个人主页，前台展示 + 后台管理。
风格：**暖纸卡片式**（图书馆卡片目录美学），单主题（亮色），无暗色模式。

## 技术栈
| 层 | 技术 |
|----|------|
| 前端 | Vue 3 (Composition API) + Vue Router + Vite |
| 样式 | Tailwind CSS v4 + CSS 自定义属性 |
| 后端 | Express 5 (ES Module) |
| 数据库 | sql.js（纯 JS SQLite） |
| 密码 | HMAC-SHA256 + 16字节随机盐 |
| 运行时 | Node.js ≥18 |

## 设计系统（不可偏离）

### 调色板
```css
--paper:      #f7f3eb    /* 页面背景 */
--card:       #fcf9f4    /* 卡片背景 */
--ink:        #2c2416    /* 主文字色 */
--ink-light:  #6b5e4a    /* 次要文字 */
--ink-faint:  #b8a88a    /* 极淡文字 / 占位 */
--rule:       #d4c9b5    /* 边框 / 分割线 */
--accent:     #8b4513    /* 强调色（栗棕） */
--tag-bg:     #f0e8d8    /* 标签 / 按钮默认背景 */
```
**禁止**使用 Tailwind 默认色板（如 `blue-500`、`gray-200`），所有颜色必须引用上述 CSS 变量或对应 hex 值。

### 字体
- **衬线体**：`'Noto Serif SC', 'Georgia', 'SimSun', serif`（标题、正文）
- **等宽体**：`'Courier New', monospace`（编号、索书号）
- Noto Serif SC 通过 Google Fonts 加载（`index.html` 中 `<link>`）

### 组件样式
所有交互效果由 **CSS 类** 处理，**严禁**在模板中使用内联 `@mouseenter`/`@mouseleave`/`@focus`/`@blur`：

| CSS 类 | 用途 |
|--------|------|
| `.input-field` | 纸色背景输入框，`:focus` 自动高亮边框为 `--accent` |
| `.input-white` | 白色背景输入框（卡片内嵌套使用），`:focus` 同上 |
| `.btn-save` | 保存按钮，`:hover` 自动反色为 `--accent` 背景 + 白字 |
| `.link-card` | 链接卡片，`:hover` 自动右移 + 微旋转 + 加深阴影 |

### 布局
- 最大宽度 `680px`（前台）/ `720px`（后台），水平居中
- 卡片 `border-radius: 3px`（`rounded-sm`）
- 卡片间间距 `gap-2.5`（前台）/ `gap-3`（后台链接管理）
- 分隔线使用 `<div>` + `border-b` 或 `h-px`，颜色统一 `var(--rule)`

## 项目结构
```
index.html              Google Fonts 加载 + favicon placeholder
src/
  main.js               Vue 入口
  App.vue               根组件（仅 `<router-view />`）
  style.css             Tailwind 入口 + CSS 变量 + 组件类
  router/index.js       路由：/ → HomePage, /admin → AdminPage
  views/
    HomePage.vue        前台：骨架屏 → 个人信息 + 链接卡片 + 备案号
    AdminPage.vue       后台：登录 + 头像预览 + 表单 + 链接管理 + Toast
server.js               Express（API + 静态文件 + 速率限制）
db/database.js          SQLite CRUD + 密码哈希 + schema 迁移
vite.config.js          Vite 配置
```

## 数据库表
| 表 | 字段 |
|----|------|
| `profile` | `key`, `value`（name / avatar / bio） |
| `links` | `id`, `title`, `url`, `description`, `call_number`, `sort_order` |
| `settings` | `key`, `value`（password_hash / favicon_url / icp_number / police_number） |

## API 路由
| 方法 | 路径 | 说明 |
|------|------|------|
| GET/PUT | `/api/profile` | 个人信息 |
| GET/PUT | `/api/links` | 链接列表 |
| GET/PUT | `/api/settings` | 批量设置（favicon / ICP / 公安） |
| POST | `/api/auth/verify` | `{ password }` → `{ valid }` |
| POST | `/api/auth/change-password` | `{ oldPassword, newPassword }` |

## 编码铁律
1. **所有文件 UTF-8 无 BOM**。只能用 Python `open(p, "w", encoding="utf-8")` 写中文文件，禁止 PowerShell `Out-File -Encoding UTF8`（带 BOM）和 PowerShell 管道传中文（乱码）。
2. **颜色**：只用 `var(--xxx)` 或 `style="color:var(--xxx)"`，不用 Tailwind 颜色类。
3. **交互**：只用 CSS 类（`.input-field`、`.btn-save`、`.link-card`），不用内联事件。
4. **SQL**：只用 `db.prepare()` + `stmt.bind()` + `stmt.step()`，禁止字符串拼接 SQL。
5. **密码**：`hashPassword()` 生成 `salt:hash` 格式，`verifyPassword()` 向后兼容旧纯 SHA256。
6. **Vue**：`<script setup>`，`v-for` 必须带 `:key` 和 `index`，`ref()` 用于基本类型和对象，禁止 `computed` 中有副作用。
7. **DOM 操作**：仅在 `onMounted` 中操作 `document.getElementById('favicon')`，禁止在其他地方裸操作 DOM。
8. **Express 5**：通配符路由用中间件 `app.use((req,res,next)=>{...})` 而非 `app.get('*')`。

## 命令
```bash
npm run dev      # 启动（默认 :3456，含静态文件服务）
npm run build    # 构建到 dist/
```

## 部署
- 开发/单机：`npm run dev`（`server.js` 含静态文件）
- 生产 + nginx：用仓库外 `Personal_index_extra/deploy/server-prod.js`（纯 API）
- 首页 `/`，后台 `/admin`，默认密码 `admin123`
