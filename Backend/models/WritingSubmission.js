const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskNumber: { type: Number, required: true, enum: [1, 2] },
    prompt: { type: String, default: '' },
    response: { type: String, default: '' },
    wordCount: { type: Number, default: 0 },
    bandScore: Number,
    feedback: {
      taskAchievement: Number,
      coherence: Number,
      lexicalResource: Number,
      grammar: Number,
      comments: String,
    },
  },
  { _id: true }
);

const writingSubmissionSchema = new mongoose.Schema(
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
    tasks: [taskSchema],
    timeSpent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending',
    },
    bandScore: Number,
    gradedAt: Date,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

writingSubmissionSchema.index({ user: 1, status: 1, submittedAt: -1 });
writingSubmissionSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('WritingSubmission', writingSubmissionSchema);
