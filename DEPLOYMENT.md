# 部署指南

本文档介绍如何部署加拿大28投注用户后台系统。

## 部署前准备

### 1. 环境要求

- Node.js >= 16.x
- npm >= 7.x 或 yarn >= 1.22.x
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 2. 后端API准备

确保后端API服务已部署并可访问，API端点应实现以下接口：

- `GET /user/meta` - 获取元数据
- `GET /user/bets` - 获取投注明细
- `GET /user/bets/export` - 导出投注明细
- `GET /user/stats/daily` - 获取日统计
- `GET /user/odds` - 获取群赔率配置
- `POST /user/odds/set` - 保存群赔率配置

详细API规范请参考 [API.md](./API.md)

---

## 开发环境部署

### 1. 克隆或下载项目

```bash
cd /path/to/加拿大28投注
```

### 2. 安装依赖

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

### 3. 配置环境变量（可选）

复制 `.env.example` 创建 `.env` 文件：

```bash
cp .env.example .env
```

修改 `.env` 文件中的配置：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_DEFAULT_TIMEZONE=Europe/Istanbul
```

### 4. 配置API代理

编辑 `vite.config.js`，修改代理配置：

```javascript
server: {
  port: 3000,
  proxy: {
    '/user': {
      target: 'http://your-backend-api:port',  // 修改为实际后端地址
      changeOrigin: true,
    },
  },
}
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 生产环境部署

### 方式一：静态文件部署（推荐）

#### 1. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

#### 2. 配置Nginx

创建Nginx配置文件 `/etc/nginx/sites-available/canada28-admin`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/canada28-admin/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /user/ {
        proxy_pass http://your-backend-api:port;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. 启用站点并重载Nginx

```bash
sudo ln -s /etc/nginx/sites-available/canada28-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. 部署文件

```bash
# 上传dist目录到服务器
scp -r dist/* user@server:/var/www/canada28-admin/dist/

# 或使用rsync
rsync -avz --delete dist/ user@server:/var/www/canada28-admin/dist/
```

---

### 方式二：Docker部署

#### 1. 创建Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /user/ {
        proxy_pass http://backend-api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. 构建Docker镜像

```bash
docker build -t canada28-admin:latest .
```

#### 4. 运行容器

```bash
docker run -d \
  --name canada28-admin \
  -p 80:80 \
  --restart unless-stopped \
  canada28-admin:latest
```

#### 5. 使用Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  frontend:
    build: .
    container_name: canada28-admin
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8080
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: your-backend-image:latest
    container_name: canada28-backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://...
    restart: unless-stopped
```

启动服务：

```bash
docker-compose up -d
```

---

## 持续集成/持续部署（CI/CD）

### GitHub Actions示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "/var/www/canada28-admin/"

      - name: Reload Nginx
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: sudo systemctl reload nginx
```

---

## SSL/HTTPS配置

### 使用Let's Encrypt（免费）

#### 1. 安装Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

#### 2. 获取证书

```bash
sudo certbot --nginx -d your-domain.com
```

#### 3. 自动续期

Certbot会自动配置定时任务，测试续期：

```bash
sudo certbot renew --dry-run
```

---

## 性能优化

### 1. 启用Gzip压缩

在Nginx配置中已包含，确保启用。

### 2. 使用CDN

将静态资源（JS、CSS、图片）上传到CDN：

```bash
# 修改vite.config.js
export default defineConfig({
  base: 'https://cdn.your-domain.com/',
  // ...
})
```

### 3. 配置缓存策略

在Nginx配置中设置合理的缓存时间：

```nginx
# HTML不缓存
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# 静态资源长期缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 监控与日志

### 1. Nginx访问日志

```bash
tail -f /var/log/nginx/access.log
```

### 2. Nginx错误日志

```bash
tail -f /var/log/nginx/error.log
```

### 3. 应用监控

推荐集成前端监控工具：

- **Sentry**: 错误追踪
- **Google Analytics**: 用户行为分析
- **LogRocket**: 用户会话录制

---

## 故障排查

### 问题1: 页面刷新后404

**原因**: SPA路由未正确配置

**解决**: 确保Nginx配置了 `try_files`：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 问题2: API请求失败

**排查步骤**:

1. 检查后端API是否正常运行
2. 检查Nginx代理配置是否正确
3. 查看浏览器Network面板检查请求地址
4. 检查CORS配置

### 问题3: 白屏

**排查步骤**:

1. 打开浏览器控制台查看错误
2. 检查静态资源是否正确加载
3. 检查base路径配置

---

## 备份与恢复

### 备份

```bash
# 备份前端代码和配置
tar -czf canada28-admin-backup-$(date +%Y%m%d).tar.gz /var/www/canada28-admin/
```

### 恢复

```bash
# 解压备份
tar -xzf canada28-admin-backup-20251105.tar.gz -C /var/www/
```

---

## 安全建议

1. **使用HTTPS**: 强制使用SSL/TLS加密
2. **限制API访问**: 配置IP白名单或防火墙规则
3. **定期更新**: 及时更新依赖包修复安全漏洞
4. **隐藏版本信息**: 在Nginx中隐藏版本号

```nginx
http {
    server_tokens off;
}
```

5. **配置安全头**: 添加安全相关HTTP头

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

---

## 联系与支持

如有部署问题，请联系技术团队。

**文档版本**: 1.0.0  
**最后更新**: 2025-11-05

