const mongoose = require('mongoose');

const BLOCKS = [
  'methodologies',
  'reading',
  'writing',
  'listening',
  'speaking',
  'grammar_vocabulary'
];

const questionSchema = new mongoose.Schema(
  {
    exam: { type: String, enum: ['2021', '2022', '2023', '2024', '2025'], required: true },
    questionNumber: { type: Number, required: true },
    legacyId: { type: String, required: true, unique: true, index: true },
    block: { type: String, enum: BLOCKS, required: true, index: true },
    skill: { type: String, required: true },
    text: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: 'Una pregunta debe tener al menos 2 alternativas.'
      }
    },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: true },
    source: { type: String, required: true },
    // Optional: not every question has a traceable raw category from the
    // source document (e.g. the 2021/2022/2024 bank), so this is no longer
    // required. When present, it's the literal category label from the
    // original document, kept for auditability.
    sourceCategoryRaw: { type: String, default: null },
    duplicateGroupId: { type: String, default: null, index: true },
    // Flags questions whose content/classification hasn't been manually
    // double-checked against a primary source yet. Surfaced in the admin
    // view so pending items can be tracked and reviewed over time.
    _needsReview: { type: Boolean, default: false },

    // --- Context support (added for the 2021-2025 bank with shared passages) ---
    // Points to Context.contextId (NOT an ObjectId ref - contexts are matched
    // by their own string id, same as the source JSON). Null for standalone
    // questions with no shared passage.
    contextId: { type: String, default: null, index: true },
    // 'standalone' | 'member' | 'context_source' - member questions depend on
    // a passage authored elsewhere; context_source questions ARE the source
    // of their own (self-contained) context.
    contextRole: { type: String, default: 'standalone' },
    // One of: explicit_evidence | implicit_evidence_format_a |
    // implicit_evidence_format_b | no_dependency_detected | not_available
    contextStatus: { type: String, default: 'no_dependency_detected' }
  },
  { timestamps: true }
);

// Virtual populate: lets us do
//   Question.find(...).populate('context')
// without contextId being a real ObjectId ref. Matches Question.contextId
// against Context.contextId.
questionSchema.virtual('context', {
  ref: 'Context',
  localField: 'contextId',
  foreignField: 'contextId',
  justOne: true
});

module.exports = mongoose.model('Question', questionSchema);
module.exports.BLOCKS = BLOCKS;
