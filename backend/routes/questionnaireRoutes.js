const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const authMiddleware = require('../middleware/auth');

// 获取问卷（需要认证）
router.get('/', authMiddleware.protect, questionnaireController.getQuestionnaire);

// 保存问卷（需要认证）
router.post('/save', authMiddleware.protect, questionnaireController.saveQuestionnaire);

// 提交问卷（需要认证）
router.post('/submit', authMiddleware.protect, questionnaireController.submitQuestionnaire);

module.exports = router;