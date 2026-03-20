const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  basicInfo: {
    gender: {
      type: String,
      enum: ['男', '女', '其他']
    },
    preferredGender: {
      type: String,
      enum: ['男', '女', '不限']
    },
    purpose: {
      type: String,
      enum: ['恋爱', '交友', '婚姻', '其他']
    },
    age: {
      type: Number
    },
    campus: {
      type: String
    },
    hometown: {
      type: String
    },
    education: {
      type: String
    }
  },
  familyAttitude: {
    marriageIntention: {
      type: Number,
      min: 1,
      max: 7
    },
    familyLifeView: {
      type: String
    },
    childrenAttitude: {
      type: Number,
      min: 1,
      max: 7
    }
  },
  lifestyle: {
    consumptionStyle: {
      type: Number,
      min: 1,
      max: 7
    },
    drinking: {
      type: Boolean
    },
    freeTimeActivities: {
      type: [String]
    },
    sleepSchedule: {
      type: String
    }
  },
  interests: {
    hobbies: {
      type: [String]
    },
    sports: {
      type: [String]
    },
    music: {
      type: [String]
    },
    movies: {
      type: [String]
    }
  },
  personality: {
    relationshipAttitude: {
      type: Object
    },
    socialHabits: {
      type: Number,
      min: 1,
      max: 7
    },
    jungianType: {
      type: String
    }
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// 自动更新updatedAt字段
questionnaireSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);

module.exports = Questionnaire;