const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: String,
      default: '',
    },
    module: {
      type: String,
      enum: ['listening', 'reading', 'writing', 'unknown'],
      default: 'unknown',
    },
    reportType: {
      type: String,
      required: true,
      enum: ['wrong-answer', 'typo', 'audio-issue', 'missing-content', 'other'],
    },
    questionNumber: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'resolved', 'dismissed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
