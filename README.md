# 🌐 个人主页

基于 **Vue 3 + Express + SQLite** 的轻量级个人主页系统，支持前台展示与后台管理。

## ✨ 功能

- **个人信息展示** — 头像（图床 / Emoji）、姓名、简介
- **子网站导航** — 动态链接列表，支持排序、增删改
- **暗/亮模式** — 一键切换，偏好自动保存
- **后台管理** — 密码保护，可视化编辑所有内容
- **网站图标** — 支持图床链接，动态生效
- **备案悬挂** — ICP 备案号 + 公安备案号，点击跳转官方查询
- **所有操作有 Toast 反馈**

## 🎨 设计

| 模式 | 风格 |
|------|------|
| 暗色 🌙 | 深色背景 + 网格底纹 + 青色点缀（融合C） |
| 亮色 ☀️ | 极简白面板 + 大量留白 |

风格参考样例见仓库外 `Personal_index_extra/style-samples/`。

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3 (Composition API) + Vue Router + Vite |
| 样式 | Tailwind CSS v4 |
| 后端 | Express 5 |
| 数据库 | sql.js（纯 JS SQLite，无需安装数据库） |
| 密码 | SHA-256 哈希 |

## 🚀 本地运行

```bash
# 安装依赖
npm install

# 启动（http://localhost:3456）
npm run dev
```

- 主页：`http://localhost:3456`
- 后台：`http://localhost:3456/admin`
- 默认密码：`admin123`

## 📦 部署（Linux + nginx）

项目自带两个服务端入口：

| 文件 | 用途 |
|------|------|
| `server.js` | 完整版，自带静态文件服务，适合开发/单机 |
| `server-prod.js` | 纯 API 版，配合 nginx 使用（位于仓库外 `Personal_index_extra/deploy/`） |

### nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /opt/personal-homepage/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3456;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 启动

```bash
npm install && npm run build
pm2 start server-prod.js --name personal-api
pm2 save
```

## 📁 项目结构

```
src/views/HomePage.vue    前台主页，数据从 /api 加载
src/views/AdminPage.vue   后台管理（个人信息 / 网站设置 / 密码 / 链接）
src/router/index.js       路由：/ 和 /admin
src/style.css             Tailwind + @custom-variant dark + 网格背景
server.js                 Express 服务器（API + 静态文件）
db/database.js            SQLite CRUD + 密码哈希
```

## 🔄 Git 更新流程

```bash
git pull
npm install
npm run build
pm2 restart personal-api    # 如果改了后端
```

## 📄 License

MIT
