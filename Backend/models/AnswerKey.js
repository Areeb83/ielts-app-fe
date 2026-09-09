const mongoose = require('mongoose');

const answerKeySchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    skill: {
      type: String,
      required: true,
      index: true,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AnswerKey', answerKeySchema);
