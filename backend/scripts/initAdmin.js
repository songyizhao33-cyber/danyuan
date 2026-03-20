const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('数据库连接成功');

  // 检查是否已有管理员账户
  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('管理员账户已存在');
    process.exit(0);
  }

  // 创建默认管理员账户
  const admin = new Admin({
    username: 'admin',
    password: 'admin123', // 默认密码，建议登录后修改
    role: 'superadmin'
  });

  await admin.save();
  console.log('默认管理员账户创建成功');
  console.log('用户名: admin');
  console.log('密码: admin123');
  console.log('请登录后修改默认密码');

  process.exit(0);
})
.catch((error) => {
  console.error('数据库连接失败:', error);
  process.exit(1);
});