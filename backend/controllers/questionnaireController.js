const Questionnaire = require('../models/Questionnaire');
const User = require('../models/User');

// 获取问卷
exports.getQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 查找用户的问卷
    let questionnaire = await Questionnaire.findOne({ userId });
    
    // 如果问卷不存在，创建一个新的
    if (!questionnaire) {
      questionnaire = new Questionnaire({ userId });
      await questionnaire.save();
    }
    
    res.status(200).json({ questionnaire });
  } catch (error) {
    console.error('获取问卷失败:', error);
    res.status(500).json({ message: '获取问卷失败，请稍后重试' });
  }
};

// 保存问卷
exports.saveQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const { basicInfo, familyAttitude, lifestyle, interests, personality, progress } = req.body;
    
    // 查找用户的问卷
    let questionnaire = await Questionnaire.findOne({ userId });
    
    // 如果问卷不存在，创建一个新的
    if (!questionnaire) {
      questionnaire = new Questionnaire({ userId });
    }
    
    // 更新问卷数据
    if (basicInfo) questionnaire.basicInfo = { ...questionnaire.basicInfo, ...basicInfo };
    if (familyAttitude) questionnaire.familyAttitude = { ...questionnaire.familyAttitude, ...familyAttitude };
    if (lifestyle) questionnaire.lifestyle = { ...questionnaire.lifestyle, ...lifestyle };
    if (interests) questionnaire.interests = { ...questionnaire.interests, ...interests };
    if (personality) questionnaire.personality = { ...questionnaire.personality, ...personality };
    if (progress) questionnaire.progress = progress;
    
    await questionnaire.save();
    
    res.status(200).json({ message: '问卷保存成功', questionnaire });
  } catch (error) {
    console.error('保存问卷失败:', error);
    res.status(500).json({ message: '保存问卷失败，请稍后重试' });
  }
};

// 提交问卷
exports.submitQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const { basicInfo, familyAttitude, lifestyle, interests, personality } = req.body;
    
    // 查找用户的问卷
    let questionnaire = await Questionnaire.findOne({ userId });
    
    // 如果问卷不存在，创建一个新的
    if (!questionnaire) {
      questionnaire = new Questionnaire({ userId });
    }
    
    // 更新问卷数据
    if (basicInfo) questionnaire.basicInfo = { ...questionnaire.basicInfo, ...basicInfo };
    if (familyAttitude) questionnaire.familyAttitude = { ...questionnaire.familyAttitude, ...familyAttitude };
    if (lifestyle) questionnaire.lifestyle = { ...questionnaire.lifestyle, ...lifestyle };
    if (interests) questionnaire.interests = { ...questionnaire.interests, ...interests };
    if (personality) questionnaire.personality = { ...questionnaire.personality, ...personality };
    
    // 标记问卷为已完成
    questionnaire.isCompleted = true;
    questionnaire.progress = 100;
    questionnaire.completedAt = Date.now();
    
    await questionnaire.save();
    
    // 更新用户的问卷完成状态
    await User.findByIdAndUpdate(userId, { questionnaireCompleted: true });
    
    res.status(200).json({ message: '问卷提交成功', questionnaire });
  } catch (error) {
    console.error('提交问卷失败:', error);
    res.status(500).json({ message: '提交问卷失败，请稍后重试' });
  }
};