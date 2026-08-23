const express = require('express');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { protect } = require('../middleware/auth');
const { ACADEMIC_BLOCKS, percentage } = require('../utils/blocks');

const router = express.Router();

// POST /api/mock-exam/start  { count }
// Selects random questions across the 6 academic blocks. Deduplicates by
// duplicateGroupId first (grouping by $ifNull(duplicateGroupId, _id) so that
// questions WITHOUT a group - the majority - are never collapsed together),
// keeping only one representative per duplicate pair, THEN samples `count`
// from that deduplicated pool. This guarantees no two questions from the
// same duplicate pair ever land in the same mock exam.
router.post('/start', protect, async (req, res) => {
  try {
    const { count = 20 } = req.body;
    const size = Math.min(Math.max(parseInt(count, 10) || 20, 1), 60);

    const questions = await Question.aggregate([
      { $match: { block: { $in: ACADEMIC_BLOCKS } } },
      {
        $group: {
          _id: { $ifNull: ['$duplicateGroupId', '$_id'] },
          doc: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sample: { size } },
      {
        // Aggregate pipelines bypass Mongoose's .populate(), so the context
        // join has to happen here explicitly. 'contexts' is the actual
        // MongoDB collection name for the Context model.
        $lookup: {
          from: 'contexts',
          localField: 'contextId',
          foreignField: 'contextId',
          as: '_contextDoc'
        }
      },
      { $unwind: { path: '$_contextDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          text: 1,
          options: 1,
          block: 1,
          skill: 1,
          contextId: 1,
          contextRole: 1,
          contextStatus: 1,
          context: {
            $cond: [
              { $ifNull: ['$_contextDoc', false] },
              { contextType: '$_contextDoc.contextType', contextText: '$_contextDoc.contextText' },
              null
            ]
          }
        }
      }
    ]);

    res.json({ count: questions.length, questions });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar el simulacro.', error: err.message });
  }
});

// POST /api/mock-exam/submit  { answers: [{ questionId, selected }] }
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Debes enviar al menos una respuesta.' });
    }

    const ids = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: ids } });
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correct = 0;
    const perBlock = {};
    ACADEMIC_BLOCKS.forEach((b) => { perBlock[b] = { total: 0, correct: 0 }; });

    const gradedAnswers = answers.map((a) => {
      const q = qMap.get(a.questionId);
      if (!q) return null;
      const isCorrect = a.selected === q.correctAnswer;
      if (isCorrect) correct += 1;

      perBlock[q.block].total += 1;
      if (isCorrect) perBlock[q.block].correct += 1;

      return {
        question: q._id,
        legacyId: q.legacyId,
        selected: a.selected,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    }).filter(Boolean);

    const total = gradedAnswers.length;
    const pct = percentage(correct, total);

    const blockBreakdown = ACADEMIC_BLOCKS
      .filter((b) => perBlock[b].total > 0)
      .map((b) => ({
        block: b,
        total: perBlock[b].total,
        correct: perBlock[b].correct,
        percentage: percentage(perBlock[b].correct, perBlock[b].total)
      }));

    const attempt = await Attempt.create({
      userId: req.user._id,
      mode: 'mock_exam',
      block: null,
      score: correct,
      totalQuestions: total,
      percentage: pct,
      answers: gradedAnswers,
      blockBreakdown
    });

    res.status(201).json({
      attemptId: attempt._id,
      score: correct,
      totalQuestions: total,
      percentage: pct,
      blockBreakdown,
      answers: gradedAnswers
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar el intento del simulacro.', error: err.message });
  }
});

module.exports = router;
