const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    legacyId: { type: String, required: true },
    selected: { type: Number, required: true },
    correctAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const blockBreakdownSchema = new mongoose.Schema(
  {
    block: { type: String, required: true },
    total: { type: Number, required: true },
    correct: { type: Number, required: true },
    percentage: { type: Number, required: true }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mode: { type: String, enum: ['practice', 'mock_exam'], required: true },
    block: { type: String, default: null }, // block name for practice, null for mock_exam
    date: { type: Date, default: Date.now },
    score: { type: Number, required: true }, // number correct
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    answers: { type: [answerSchema], default: [] },
    blockBreakdown: { type: [blockBreakdownSchema], default: [] } // only populated for mock_exam
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attempt', attemptSchema);
