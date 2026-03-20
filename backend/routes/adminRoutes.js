const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// 管理员登录
router.post('/login', adminController.adminLogin);

// 获取用户列表（需要管理员权限）
router.get('/users', authMiddleware.protect, authMiddleware.admin, adminController.getUsers);

// 获取匹配统计（需要管理员权限）
router.get('/match-stats', authMiddleware.protect, authMiddleware.admin, adminController.getMatchStats);

// 手动执行匹配任务（需要管理员权限）
router.post('/run-matching', authMiddleware.protect, authMiddleware.admin, adminController.runMatchingTask);

module.exports = router;