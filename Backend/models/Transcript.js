const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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

module.exports = mongoose.model('Transcript', transcriptSchema);
