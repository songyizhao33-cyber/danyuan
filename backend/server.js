const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const questionnaireRoutes = require('./routes/questionnaireRoutes');
const matchRoutes = require('./routes/matchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { setupCronJobs } = require('./services/cronService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ message: '服务运行正常' });
});

// 数据库连接
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
  .then(() => {
    console.log('数据库连接成功');
    // 设置定时任务
    setupCronJobs();
  })
  .catch((error) => {
    console.error('数据库连接失败:', error);
    console.warn('数据库功能将不可用');
  });
} else {
  console.warn('未配置数据库连接字符串，数据库功能将不可用');
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});