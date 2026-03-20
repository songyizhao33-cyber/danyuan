const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/auth');

// 获取匹配状态（需要认证）
router.get('/status', authMiddleware.protect, matchController.getMatchStatus);

// 获取用户的匹配结果（需要认证）
router.get('/results', authMiddleware.protect, matchController.getUserMatches);

module.exports = router;