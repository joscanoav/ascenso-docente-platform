const mongoose = require('mongoose');

const contextSchema = new mongoose.Schema(
  {
    contextId: { type: String, required: true, unique: true, index: true },
    contextType: { type: String, required: true },
    // Null for self-contained contexts where the scenario already lives
    // inside the member question's own `text` (see contextType
    // "situation_implicit_selfcontained"). The frontend must treat a
    // missing/empty contextText as "no additional text to show".
    contextText: { type: String, default: null },
    memberLegacyIds: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Context', contextSchema);
