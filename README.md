# 🌐 个人主页

基于 **Vue 3 + Express + SQLite** 的轻量级个人主页，前台展示 + 后台管理。

![风格](https://img.shields.io/badge/风格-暖纸卡片式-8b4513) ![框架](https://img.shields.io/badge/Vue-3.x-4fc08d) ![许可](https://img.shields.io/badge/license-MIT-blue)

## ✨ 功能

- **个人信息展示** — 头像（图床 / Emoji）、姓名、简介
- **子网站导航** — 动态链接列表，支持排序、增删改、自定义编号
- **后台管理** — 密码保护，可视化编辑所有内容，操作有 Toast 反馈
- **网站图标** — 支持图床链接，动态生效
- **备案悬挂** — ICP 备案号 + 公安备案号，点击跳转官方查询
- **骨架屏加载** — 数据加载时展示骨架动画

## 🎨 设计

暖纸卡片目录美学，灵感来自传统图书馆的卡片目录柜。

| 元素 | 选择 |
|------|------|
| 色调 | 暖纸 `#f7f3eb` + 墨色 `#2c2416` + 栗棕 `#8b4513` |
| 字体 | Noto Serif SC（衬线）、Courier New（等宽） |
| 容器 | 纸质卡片风格，3px 圆角 + 微弱阴影 |
| 交互 | 纯 CSS hover 效果，卡片抽出式微动效 |

风格参考样例见 `../Personal_index_extra/redesign-samples/`。

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Vue 3 (Composition API) + Vue Router + Vite |
| 样式 | Tailwind CSS v4 + CSS 自定义属性 |
| 后端 | Express 5 (ES Module) |
| 数据库 | sql.js（纯 JS SQLite，无需安装） |
| 密码 | HMAC-SHA256 + 16 字节随机盐 |

## 🚀 本地运行

```bash
npm install
npm run dev       # http://localhost:3456
```

- 主页：`http://localhost:3456`
- 后台：`http://localhost:3456/admin`
- 默认密码：`admin123`

## 📁 项目结构

```
index.html              Google Fonts + favicon
src/
  style.css             CSS 变量 + 组件类
  views/
    HomePage.vue        前台主页
    AdminPage.vue       后台管理
server.js               Express（API + 静态文件 + 速率限制）
db/database.js          SQLite CRUD + 密码哈希
```

## 📦 部署（Linux + nginx）

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

```bash
npm install && npm run build
pm2 start server-prod.js --name personal-api
pm2 save
```

生产版 `server-prod.js` 位于仓库外 `Personal_index_extra/deploy/`。

## 🔄 Git 更新流程

```bash
git pull
npm install
npm run build
pm2 restart personal-api
```

## 📄 License

MIT
