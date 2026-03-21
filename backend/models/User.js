const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._%+-]+@(m\.)?fudan\.edu\.cn$/.test(v);
      },
      message: '请输入有效的复旦大学邮箱（@fudan.edu.cn 或 @m.fudan.edu.cn）'
    }
  },
  password: {
    type: String,
    select: false
  },
  verifyCode: {
    type: String,
    select: false
  },
  verifyCodeExpire: {
    type: Date,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  questionnaireCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
});

// 密码哈希
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// 密码验证
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;