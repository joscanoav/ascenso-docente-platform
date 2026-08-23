const express = require('express');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const { protect } = require('../middleware/auth');
const { ACADEMIC_BLOCKS, percentage } = require('../utils/blocks');

const router = express.Router();

// POST /api/practice/start  { block, count }
router.post('/start', protect, async (req, res) => {
  try {
    const { block, count = 10 } = req.body;

    if (!ACADEMIC_BLOCKS.includes(block)) {
      return res.status(400).json({ message: `Bloque invalido. Debe ser uno de: ${ACADEMIC_BLOCKS.join(', ')}` });
    }

    const size = Math.min(Math.max(parseInt(count, 10) || 10, 1), 60);

    const questions = await Question.aggregate([
      { $match: { block } },
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

    res.json({ block, count: questions.length, questions });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar la practica.', error: err.message });
  }
});

// POST /api/practice/submit  { block, answers: [{ questionId, selected }] }
router.post('/submit', protect, async (req, res) => {
  try {
    const { block, answers } = req.body;

    if (!ACADEMIC_BLOCKS.includes(block)) {
      return res.status(400).json({ message: 'Bloque invalido.' });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Debes enviar al menos una respuesta.' });
    }

    const ids = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: ids } });
    const qMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correct = 0;
    const gradedAnswers = answers.map((a) => {
      const q = qMap.get(a.questionId);
      if (!q) return null;
      const isCorrect = a.selected === q.correctAnswer;
      if (isCorrect) correct += 1;
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

    const attempt = await Attempt.create({
      userId: req.user._id,
      mode: 'practice',
      block,
      score: correct,
      totalQuestions: total,
      percentage: pct,
      answers: gradedAnswers
    });

    res.status(201).json({
      attemptId: attempt._id,
      block,
      score: correct,
      totalQuestions: total,
      percentage: pct,
      answers: gradedAnswers
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al guardar el intento de practica.', error: err.message });
  }
});

module.exports = router;
