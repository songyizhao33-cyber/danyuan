const Admin = require('../models/Admin');
const User = require('../models/User');
const Match = require('../models/Match');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 管理员登录
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找管理员
    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
      return res.status(400).json({ message: '管理员不存在' });
    }

    // 验证密码
    if (!(await admin.comparePassword(password))) {
      return res.status(400).json({ message: '密码错误' });
    }

    // 更新上次登录时间
    admin.lastLoginAt = Date.now();
    await admin.save();

    // 生成JWT token
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
};

// 获取用户列表
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -verifyCode -verifyCodeExpire');
    res.status(200).json({ users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '获取用户列表失败，请稍后重试' });
  }
};

// 获取匹配统计
exports.getMatchStats = async (req, res) => {
  try {
    // 总用户数
    const totalUsers = await User.countDocuments();
    // 已完成问卷的用户数
    const completedUsers = await User.countDocuments({ questionnaireCompleted: true });
    // 总匹配数
    const totalMatches = await Match.countDocuments();
    // 最近一次匹配轮次
    const lastMatch = await Match.findOne().sort({ matchRound: -1 });
    const currentRound = lastMatch ? lastMatch.matchRound : 0;

    // 各轮次匹配统计
    const roundStats = [];
    for (let i = 1; i <= currentRound; i++) {
      const roundMatches = await Match.countDocuments({ matchRound: i });
      roundStats.push({ round: i, matchCount: roundMatches });
    }

    res.status(200).json({
      stats: {
        totalUsers,
        completedUsers,
        totalMatches,
        currentRound,
        roundStats
      }
    });
  } catch (error) {
    console.error('获取匹配统计失败:', error);
    res.status(500).json({ message: '获取匹配统计失败，请稍后重试' });
  }
};

// 手动执行匹配任务
exports.runMatchingTask = async (req, res) => {
  try {
    const { runMatchingTask } = require('../services/matchService');
    const matches = await runMatchingTask();
    res.status(200).json({ message: '匹配任务执行成功', matches });
  } catch (error) {
    console.error('执行匹配任务失败:', error);
    res.status(500).json({ message: '执行匹配任务失败，请稍后重试' });
  }
};