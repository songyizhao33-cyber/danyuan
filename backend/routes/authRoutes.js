const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// 发送验证码
router.post('/send-verification-code', authController.sendVerificationCode);

// 验证码登录/注册
router.post('/verify-code-login', authController.verifyCodeLogin);

// 密码登录
router.post('/password-login', authController.passwordLogin);

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware.protect, authController.getCurrentUser);

module.exports = router;