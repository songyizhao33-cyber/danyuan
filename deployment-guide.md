# 旦缘 - 部署指南

## 1. 系统要求

### 1.1 前端
- Node.js 18+
- npm 8+

### 1.2 后端
- Node.js 18+
- npm 8+
- MongoDB 6+

## 2. 环境配置

### 2.1 前端配置
1. 进入前端目录
   ```bash
   cd frontend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 构建前端
   ```bash
   npm run build
   ```

4. 部署到 Vercel
   - 登录 Vercel 账户
   - 点击 "New Project"
   - 选择前端目录
   - 点击 "Deploy"

### 2.2 后端配置
1. 进入后端目录
   ```bash
   cd backend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   创建 `.env` 文件，添加以下内容：
   ```env
   # 数据库连接信息
   MONGODB_URI=mongodb://localhost:27017/danyuan

   # JWT配置
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d

   # 邮件服务配置
   EMAIL_SERVICE=163
   EMAIL_USER=danyuan2026@163.com
   EMAIL_PASS=your_email_password

   # 验证码配置
   VERIFY_CODE_EXPIRE=15m
   ```

4. 部署到 Railway
   - 登录 Railway 账户
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择后端仓库
   - 配置环境变量
   - 点击 "Deploy"

### 2.3 数据库配置
1. 安装 MongoDB
   - 下载并安装 MongoDB 6+
   - 启动 MongoDB 服务

2. 创建数据库
   - 连接 MongoDB
   ```bash
   mongo
   ```
   - 创建数据库
   ```javascript
   use danyuan
   ```

3. 创建默认管理员账户
   ```bash
   node scripts/initAdmin.js
   ```

## 3. 部署步骤

### 3.1 前端部署
1. 构建前端
   ```bash
   npm run build
   ```

2. 部署到 Vercel
   - 登录 Vercel 账户
   - 选择前端构建目录 `dist`
   - 配置域名（可选）
   - 点击 "Deploy"

### 3.2 后端部署
1. 配置环境变量
   - 在 Railway 控制台中配置环境变量
   - 确保 `MONGODB_URI` 指向正确的 MongoDB 实例

2. 部署到 Railway
   - Railway 会自动构建和部署后端服务
   - 部署完成后，获取后端 API 地址

3. 更新前端 API 地址
   - 在前端代码中更新 `API_BASE_URL` 为后端 API 地址
   - 重新构建和部署前端

## 4. 环境变量说明

### 4.1 前端环境变量
- `VITE_API_BASE_URL`：后端 API 基础地址（可选，默认为 http://localhost:5000/api）

### 4.2 后端环境变量
- `MONGODB_URI`：MongoDB 连接字符串
- `JWT_SECRET`：JWT 签名密钥
- `JWT_EXPIRES_IN`：JWT 过期时间
- `EMAIL_SERVICE`：邮件服务提供商
- `EMAIL_USER`：邮件账户
- `EMAIL_PASS`：邮件账户密码
- `VERIFY_CODE_EXPIRE`：验证码过期时间

## 5. 数据库初始化

### 5.1 创建默认管理员账户
```bash
node scripts/initAdmin.js
```

默认管理员账户：
- 用户名：admin
- 密码：admin123
- 角色：superadmin

### 5.2 数据迁移（可选）
如果需要导入现有数据，可以使用 MongoDB 的 `mongoimport` 工具。

## 6. 监控和维护

### 6.1 日志监控
- 前端：Vercel 日志
- 后端：Railway 日志
- 数据库：MongoDB 日志

### 6.2 常见问题
1. **邮件发送失败**
   - 检查邮件服务配置
   - 确保邮件账户开启了 SMTP 服务

2. **数据库连接失败**
   - 检查 MongoDB 服务是否运行
   - 检查 `MONGODB_URI` 配置

3. **匹配任务未执行**
   - 检查定时任务是否正常运行
   - 手动执行匹配任务：`POST /api/admin/run-matching`

## 7. 上线检查清单

- [ ] 前端构建成功
- [ ] 后端部署成功
- [ ] 数据库连接正常
- [ ] 邮件服务配置正确
- [ ] 默认管理员账户创建成功
- [ ] 匹配任务配置正确
- [ ] 所有 API 端点测试通过
- [ ] 前端页面加载正常
- [ ] 响应式设计适配 PC 和移动端

## 8. 后续维护

### 8.1 代码更新
1. 前端：推送代码到 GitHub，Vercel 会自动部署
2. 后端：推送代码到 GitHub，Railway 会自动部署

### 8.2 数据库备份
- 定期备份 MongoDB 数据库
- 使用 MongoDB Atlas 的自动备份功能（推荐）

### 8.3 安全更新
- 定期更新依赖包
- 检查并修复安全漏洞
- 更新 JWT 密钥

## 9. 联系方式

如果遇到部署问题，请联系：
- 技术支持：danyuan2026@163.com
- 管理员：admin@danyuan.com