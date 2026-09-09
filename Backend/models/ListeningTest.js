const mongoose = require('mongoose');

const listeningTestSchema = new mongoose.Schema(
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
      default: 'listening',
    },
    examType: {
      type: String,
      default: 'academic',
    },
    title: {
      type: String,
      required: true,
    },
    audioSrc: String,
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

module.exports = mongoose.model('ListeningTest', listeningTestSchema);
