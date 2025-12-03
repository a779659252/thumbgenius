# IFLOW.md

## 概览

ThumbGenius 是一个基于 Web 的缩略图生成器。它允许用户上传背景图片，添加和操作文本图层，并从预设或自定义模板中进行选择，以创建具有专业外观的缩略图。该项目使用 React、TypeScript 和 Vite 构建，并利用 `lucide-react` 提供图标。

## 主要特点

- **图片上传：** 用户可以上传自己的图片作为缩略图背景。
- **文本图层：** 支持多个可拖动的文本图层，具有可自定义的属性，如字体大小、颜色和内容。
- **模板：** 提供预设模板和保存/加载自定义模板的功能。
- **响应式画布：** 画布会根据视口大小自动缩放。
- **本地存储：** 项目状态和自定义模板会自动保存到本地存储中。

## 技术栈

- **前端：** React, TypeScript
- **构建工具：** Vite
- **图标：** lucide-react
- **样式：** (可能是 Tailwind CSS，根据类名推断)

## 构建和运行

### 开发环境

要在本地运行开发服务器：

```bash
npm install
npm run dev
```

### 生产构建

要为生产环境构建项目：

```bash
npm run build
```

## 部署

该项目可以通过 Docker 进行容器化。以下是推荐的 `Dockerfile` 和 `docker-compose.yml` 配置。

### Dockerfile

```dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
  listen 80;
  server_name localhost;

  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8080:80"
```

要使用 Docker Compose 启动服务，请运行：

```bash
docker-compose up -d
```

然后，在浏览器中访问 `http://localhost:8080`。
