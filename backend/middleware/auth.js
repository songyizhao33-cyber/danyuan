const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// JWT认证中间件
exports.protect = async (req, res, next) => {
  try {
    // 从请求头获取token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: '请先登录' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 查找用户
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证失败:', error);
    res.status(401).json({ message: '认证失败，请重新登录' });
  }
};

// 管理员权限中间件
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '没有管理员权限' });
  }
};