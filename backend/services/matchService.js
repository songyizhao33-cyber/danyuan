const User = require('../models/User');
const Questionnaire = require('../models/Questionnaire');
const Match = require('../models/Match');
const { sendMatchResult } = require('./emailService');

// 计算两个用户之间的相似度
const calculateSimilarity = (user1, user2) => {
  let totalScore = 0;
  let totalWeight = 0;

  // 基础信息相似度（权重：0.2）
  if (user1.basicInfo && user2.basicInfo) {
    if (user1.basicInfo.preferredGender === '不限' || user2.basicInfo.gender === user1.basicInfo.preferredGender) {
      totalScore += 100 * 0.2;
    }
    if (user1.basicInfo.gender === '不限' || user1.basicInfo.gender === user2.basicInfo.preferredGender) {
      totalScore += 100 * 0.2;
    }
    totalWeight += 0.4;

    // 年龄相似度
    if (user1.basicInfo.age && user2.basicInfo.age) {
      const ageDiff = Math.abs(user1.basicInfo.age - user2.basicInfo.age);
      const ageScore = Math.max(0, 100 - ageDiff * 10);
      totalScore += ageScore * 0.1;
      totalWeight += 0.1;
    }

    // 校区相似度
    if (user1.basicInfo.campus && user2.basicInfo.campus) {
      if (user1.basicInfo.campus === user2.basicInfo.campus) {
        totalScore += 100 * 0.1;
      }
      totalWeight += 0.1;
    }
  }

  // 家庭婚育态度相似度（权重：0.2）
  if (user1.familyAttitude && user2.familyAttitude) {
    if (user1.familyAttitude.marriageIntention && user2.familyAttitude.marriageIntention) {
      const marriageDiff = Math.abs(user1.familyAttitude.marriageIntention - user2.familyAttitude.marriageIntention);
      const marriageScore = 100 - (marriageDiff / 6) * 100;
      totalScore += marriageScore * 0.1;
      totalWeight += 0.1;
    }

    if (user1.familyAttitude.childrenAttitude && user2.familyAttitude.childrenAttitude) {
      const childrenDiff = Math.abs(user1.familyAttitude.childrenAttitude - user2.familyAttitude.childrenAttitude);
      const childrenScore = 100 - (childrenDiff / 6) * 100;
      totalScore += childrenScore * 0.1;
      totalWeight += 0.1;
    }
  }

  // 生活习惯相似度（权重：0.2）
  if (user1.lifestyle && user2.lifestyle) {
    if (user1.lifestyle.consumptionStyle && user2.lifestyle.consumptionStyle) {
      const consumptionDiff = Math.abs(user1.lifestyle.consumptionStyle - user2.lifestyle.consumptionStyle);
      const consumptionScore = 100 - (consumptionDiff / 6) * 100;
      totalScore += consumptionScore * 0.1;
      totalWeight += 0.1;
    }

    if (user1.lifestyle.drinking !== undefined && user2.lifestyle.drinking !== undefined) {
      if (user1.lifestyle.drinking === user2.lifestyle.drinking) {
        totalScore += 100 * 0.1;
      }
      totalWeight += 0.1;
    }

    // 空余时间活动相似度
    if (user1.lifestyle.freeTimeActivities && user2.lifestyle.freeTimeActivities) {
      const commonActivities = user1.lifestyle.freeTimeActivities.filter(activity => 
        user2.lifestyle.freeTimeActivities.includes(activity)
      );
      const activityScore = (commonActivities.length / Math.max(user1.lifestyle.freeTimeActivities.length, user2.lifestyle.freeTimeActivities.length)) * 100;
      totalScore += activityScore * 0.1;
      totalWeight += 0.1;
    }
  }

  // 兴趣爱好相似度（权重：0.2）
  if (user1.interests && user2.interests) {
    // 爱好相似度
    if (user1.interests.hobbies && user2.interests.hobbies) {
      const commonHobbies = user1.interests.hobbies.filter(hobby => 
        user2.interests.hobbies.includes(hobby)
      );
      const hobbyScore = (commonHobbies.length / Math.max(user1.interests.hobbies.length, user2.interests.hobbies.length)) * 100;
      totalScore += hobbyScore * 0.05;
      totalWeight += 0.05;
    }

    // 运动相似度
    if (user1.interests.sports && user2.interests.sports) {
      const commonSports = user1.interests.sports.filter(sport => 
        user2.interests.sports.includes(sport)
      );
      const sportScore = (commonSports.length / Math.max(user1.interests.sports.length, user2.interests.sports.length)) * 100;
      totalScore += sportScore * 0.05;
      totalWeight += 0.05;
    }

    // 音乐相似度
    if (user1.interests.music && user2.interests.music) {
      const commonMusic = user1.interests.music.filter(music => 
        user2.interests.music.includes(music)
      );
      const musicScore = (commonMusic.length / Math.max(user1.interests.music.length, user2.interests.music.length)) * 100;
      totalScore += musicScore * 0.05;
      totalWeight += 0.05;
    }

    // 电影相似度
    if (user1.interests.movies && user2.interests.movies) {
      const commonMovies = user1.interests.movies.filter(movie => 
        user2.interests.movies.includes(movie)
      );
      const movieScore = (commonMovies.length / Math.max(user1.interests.movies.length, user2.interests.movies.length)) * 100;
      totalScore += movieScore * 0.05;
      totalWeight += 0.05;
    }
  }

  // 人格测试相似度（权重：0.2）
  if (user1.personality && user2.personality) {
    if (user1.personality.socialHabits && user2.personality.socialHabits) {
      const socialDiff = Math.abs(user1.personality.socialHabits - user2.personality.socialHabits);
      const socialScore = 100 - (socialDiff / 6) * 100;
      totalScore += socialScore * 0.1;
      totalWeight += 0.1;
    }

    if (user1.personality.jungianType && user2.personality.jungianType) {
      if (user1.personality.jungianType === user2.personality.jungianType) {
        totalScore += 100 * 0.1;
      }
      totalWeight += 0.1;
    }
  }

  // 计算最终相似度
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};

// K-means聚类算法
const kmeans = (data, k) => {
  // 初始化聚类中心
  let centroids = [];
  for (let i = 0; i < k; i++) {
    centroids.push(data[Math.floor(Math.random() * data.length)]);
  }

  let clusters = [];
  let converged = false;

  while (!converged) {
    // 初始化聚类
    clusters = Array(k).fill().map(() => []);

    // 分配数据点到最近的聚类中心
    data.forEach(user => {
      let minDistance = Infinity;
      let closestCluster = 0;

      centroids.forEach((centroid, index) => {
        const distance = calculateDistance(user, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCluster = index;
        }
      });

      clusters[closestCluster].push(user);
    });

    // 更新聚类中心
    const newCentroids = centroids.map((centroid, index) => {
      if (clusters[index].length === 0) {
        return centroid;
      }

      // 计算聚类中心
      const center = {
        basicInfo: {},
        familyAttitude: {},
        lifestyle: {},
        interests: {},
        personality: {}
      };

      // 计算基础信息中心
      if (clusters[index].some(user => user.basicInfo && user.basicInfo.age)) {
        const ages = clusters[index].map(user => user.basicInfo?.age || 0).filter(age => age > 0);
        center.basicInfo.age = ages.reduce((sum, age) => sum + age, 0) / ages.length;
      }

      // 计算家庭婚育态度中心
      if (clusters[index].some(user => user.familyAttitude && user.familyAttitude.marriageIntention)) {
        const marriageIntentions = clusters[index].map(user => user.familyAttitude?.marriageIntention || 0).filter(val => val > 0);
        center.familyAttitude.marriageIntention = marriageIntentions.reduce((sum, val) => sum + val, 0) / marriageIntentions.length;
      }

      if (clusters[index].some(user => user.familyAttitude && user.familyAttitude.childrenAttitude)) {
        const childrenAttitudes = clusters[index].map(user => user.familyAttitude?.childrenAttitude || 0).filter(val => val > 0);
        center.familyAttitude.childrenAttitude = childrenAttitudes.reduce((sum, val) => sum + val, 0) / childrenAttitudes.length;
      }

      // 计算生活习惯中心
      if (clusters[index].some(user => user.lifestyle && user.lifestyle.consumptionStyle)) {
        const consumptionStyles = clusters[index].map(user => user.lifestyle?.consumptionStyle || 0).filter(val => val > 0);
        center.lifestyle.consumptionStyle = consumptionStyles.reduce((sum, val) => sum + val, 0) / consumptionStyles.length;
      }

      // 计算人格测试中心
      if (clusters[index].some(user => user.personality && user.personality.socialHabits)) {
        const socialHabits = clusters[index].map(user => user.personality?.socialHabits || 0).filter(val => val > 0);
        center.personality.socialHabits = socialHabits.reduce((sum, val) => sum + val, 0) / socialHabits.length;
      }

      return center;
    });

    // 检查是否收敛
    converged = centroids.every((centroid, index) => {
      return calculateDistance(centroid, newCentroids[index]) < 0.1;
    });

    centroids = newCentroids;
  }

  return clusters;
};

// 计算两个用户之间的距离
const calculateDistance = (user1, user2) => {
  let distance = 0;
  let count = 0;

  // 年龄距离
  if (user1.basicInfo?.age && user2.basicInfo?.age) {
    distance += Math.pow(user1.basicInfo.age - user2.basicInfo.age, 2);
    count++;
  }

  // 婚姻意愿距离
  if (user1.familyAttitude?.marriageIntention && user2.familyAttitude?.marriageIntention) {
    distance += Math.pow(user1.familyAttitude.marriageIntention - user2.familyAttitude.marriageIntention, 2);
    count++;
  }

  // 生育态度距离
  if (user1.familyAttitude?.childrenAttitude && user2.familyAttitude?.childrenAttitude) {
    distance += Math.pow(user1.familyAttitude.childrenAttitude - user2.familyAttitude.childrenAttitude, 2);
    count++;
  }

  // 消费风格距离
  if (user1.lifestyle?.consumptionStyle && user2.lifestyle?.consumptionStyle) {
    distance += Math.pow(user1.lifestyle.consumptionStyle - user2.lifestyle.consumptionStyle, 2);
    count++;
  }

  // 社交习惯距离
  if (user1.personality?.socialHabits && user2.personality?.socialHabits) {
    distance += Math.pow(user1.personality.socialHabits - user2.personality.socialHabits, 2);
    count++;
  }

  return count > 0 ? Math.sqrt(distance / count) : 0;
};

// 执行匹配
const performMatching = async () => {
  try {
    // 获取所有已完成问卷的用户
    const users = await User.find({ questionnaireCompleted: true });
    if (users.length < 2) {
      console.log('用户数量不足，无法进行匹配');
      return;
    }

    // 获取用户的问卷数据
    const userData = [];
    for (const user of users) {
      const questionnaire = await Questionnaire.findOne({ userId: user._id });
      if (questionnaire) {
        userData.push({
          userId: user._id,
          email: user.email,
          ...questionnaire.toObject()
        });
      }
    }

    // 确定聚类数量
    const k = Math.min(Math.floor(Math.sqrt(userData.length / 2)), 5);

    // 聚类用户
    const clusters = kmeans(userData, k);

    // 生成匹配结果
    const matches = [];
    for (const cluster of clusters) {
      // 在每个聚类内进行匹配
      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          const user1 = cluster[i];
          const user2 = cluster[j];

          // 计算相似度
          const similarity = calculateSimilarity(user1, user2);

          // 只保存相似度高于60%的匹配
          if (similarity >= 60) {
            // 检查是否已经匹配过
            const existingMatch = await Match.findOne({
              $or: [
                { userId1: user1.userId, userId2: user2.userId },
                { userId1: user2.userId, userId2: user1.userId }
              ]
            });

            if (!existingMatch) {
              // 获取当前匹配轮次
              const lastMatch = await Match.findOne().sort({ matchRound: -1 });
              const matchRound = lastMatch ? lastMatch.matchRound + 1 : 1;

              // 创建匹配记录
              const match = new Match({
                userId1: user1.userId,
                userId2: user2.userId,
                matchScore: similarity,
                matchRound
              });

              await match.save();
              matches.push({
                user1: user1.email,
                user2: user2.email,
                matchScore: similarity
              });

              // 发送匹配通知
              await sendMatchResult(user1.email, user2.email, similarity);
              await sendMatchResult(user2.email, user1.email, similarity);

              // 更新匹配通知状态
              await Match.findByIdAndUpdate(match._id, {
                isNotified1: true,
                isNotified2: true
              });
            }
          }
        }
      }
    }

    console.log(`匹配完成，共生成 ${matches.length} 个匹配`);
    return matches;
  } catch (error) {
    console.error('执行匹配失败:', error);
    throw error;
  }
};

// 获取匹配状态
exports.getMatchStatus = async () => {
  try {
    // 计算距离下一轮匹配的时间（假设每周日晚上12点执行匹配）
    const now = new Date();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(23, 59, 59, 999);
    const countdown = Math.ceil((nextSunday - now) / (1000 * 60 * 60 * 24));

    // 获取参与匹配的用户数量
    const participantCount = await User.countDocuments({ questionnaireCompleted: true });

    return { countdown, participantCount };
  } catch (error) {
    console.error('获取匹配状态失败:', error);
    throw error;
  }
};

// 执行匹配任务
exports.runMatchingTask = async () => {
  try {
    console.log('开始执行匹配任务...');
    const matches = await performMatching();
    console.log('匹配任务执行完成');
    return matches;
  } catch (error) {
    console.error('执行匹配任务失败:', error);
    throw error;
  }
};

// 获取用户的匹配结果
exports.getUserMatches = async (userId) => {
  try {
    const matches = await Match.find({
      $or: [{ userId1: userId }, { userId2: userId }]
    }).populate('userId1 userId2');

    return matches.map(match => ({
      matchId: match._id,
      matchedUser: match.userId1.toString() === userId ? match.userId2 : match.userId1,
      matchScore: match.matchScore,
      matchDate: match.matchDate,
      matchRound: match.matchRound
    }));
  } catch (error) {
    console.error('获取用户匹配结果失败:', error);
    throw error;
  }
};