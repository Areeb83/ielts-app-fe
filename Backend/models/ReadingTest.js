const mongoose = require('mongoose');

const readingTestSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookId: {
      type: String,
      required: true,
      index: true,
    },
    skill: {
      type: String,
      default: 'reading',
    },
    examType: {
      type: String,
      default: 'academic',
    },
    title: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      default: 40,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

readingTestSchema.index({ examType: 1, bookId: 1 });

module.exports = mongoose.model('ReadingTest', readingTestSchema);
