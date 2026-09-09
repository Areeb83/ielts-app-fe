const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: String,
      required: true,
    },
    skill: {
      type: String,
      enum: ['listening', 'reading'],
      required: true,
    },
    examType: {
      type: String,
      default: 'academic',
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'abandoned'],
      default: 'submitted',
    },
    score: Number,
    bandScore: Number,
    timeSpent: Number,
    answers: {
      type: mongoose.Schema.Types.Mixed,
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    submittedAt: Date,
  },
  {
    timestamps: true,
  }
);

testAttemptSchema.index({ user: 1, testId: 1, submittedAt: -1 });
testAttemptSchema.index({ user: 1, skill: 1, status: 1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
