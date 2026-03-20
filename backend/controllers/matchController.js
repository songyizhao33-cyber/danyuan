const { getMatchStatus, getUserMatches } = require('../services/matchService');

// 获取匹配状态
exports.getMatchStatus = async (req, res) => {
  try {
    const status = await getMatchStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('获取匹配状态失败:', error);
    res.status(500).json({ message: '获取匹配状态失败，请稍后重试' });
  }
};

// 获取用户的匹配结果
exports.getUserMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const matches = await getUserMatches(userId);
    res.status(200).json({ matches });
  } catch (error) {
    console.error('获取匹配结果失败:', error);
    res.status(500).json({ message: '获取匹配结果失败，请稍后重试' });
  }
};