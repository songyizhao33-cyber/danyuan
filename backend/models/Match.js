const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchDate: {
    type: Date,
    default: Date.now
  },
  isNotified1: {
    type: Boolean,
    default: false
  },
  isNotified2: {
    type: Boolean,
    default: false
  },
  matchRound: {
    type: Number,
    required: true
  }
});

// 确保userId1 < userId2，避免重复匹配
matchSchema.pre('save', function(next) {
  if (this.userId1.toString() > this.userId2.toString()) {
    const temp = this.userId1;
    this.userId1 = this.userId2;
    this.userId2 = temp;
  }
  next();
});

// 创建复合唯一索引，确保每对用户只匹配一次
matchSchema.index({ userId1: 1, userId2: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;