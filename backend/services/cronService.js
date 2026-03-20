const cron = require('node-cron');
const { runMatchingTask } = require('./matchService');

// 每周日晚上12点执行匹配任务
const setupCronJobs = () => {
  // 0 0 0 * * 0 表示每周日凌晨0点执行
  cron.schedule('0 0 0 * * 0', async () => {
    console.log('执行每周匹配任务...');
    try {
      await runMatchingTask();
      console.log('每周匹配任务执行完成');
    } catch (error) {
      console.error('执行每周匹配任务失败:', error);
    }
  });

  console.log('定时任务已设置');
};

module.exports = { setupCronJobs };