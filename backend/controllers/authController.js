const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationCode } = require('../services/emailService');
require('dotenv').config();

// 生成验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送验证码
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    // 验证邮箱格式
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.cn$/.test(email)) {
      return res.status(400).json({ message: '请输入有效的教育邮箱（后缀为edu.cn）' });
    }

    // 生成验证码
    const code = generateVerificationCode();
    const expireTime = new Date(Date.now() + 15 * 60 * 1000); // 15分钟过期

    // 查找或创建用户
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    // 更新验证码和过期时间
    user.verifyCode = code;
    user.verifyCodeExpire = expireTime;
    await user.save();

    // 发送验证码邮件
    await sendVerificationCode(email, code);

    res.status(200).json({ message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ message: '发送验证码失败，请稍后重试' });
  }
};

// 验证码登录/注册
exports.verifyCodeLogin = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email }).select('+verifyCode +verifyCodeExpire');
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    // 验证验证码
    if (user.verifyCode !== code) {
      return res.status(400).json({ message: '验证码错误' });
    }

    // 验证验证码是否过期
    if (new Date() > user.verifyCodeExpire) {
      return res.status(400).json({ message: '验证码已过期' });
    }

    // 标记邮箱已验证
    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpire = undefined;

    // 如果提供了密码，设置密码
    if (password) {
      user.password = password;
    }

    // 更新上次登录时间
    user.lastLoginAt = Date.now();
    await user.save();

    // 生成JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        questionnaireCompleted: user.questionnaireCompleted,
        role: user.role
      }
    });
  } catch (error) {
    console.error('验证码登录失败:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
};

// 密码登录
exports.passwordLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    // 验证密码
    if (!user.password || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: '密码错误' });
    }

    // 更新上次登录时间
    user.lastLoginAt = Date.now();
    await user.save();

    // 生成JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        questionnaireCompleted: user.questionnaireCompleted,
        role: user.role
      }
    });
  } catch (error) {
    console.error('密码登录失败:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        questionnaireCompleted: user.questionnaireCompleted,
        role: user.role
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '获取用户信息失败，请稍后重试' });
  }
};