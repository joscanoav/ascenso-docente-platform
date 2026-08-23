const express = require('express');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');
const { ACADEMIC_BLOCKS, BLOCK_LABELS } = require('../utils/blocks');

const router = express.Router();

// GET /api/questions/blocks - metadata: how many questions exist per block
router.get('/blocks', protect, async (req, res) => {
  try {
    const counts = await Question.aggregate([
      { $group: { _id: '$block', total: { $sum: 1 } } }
    ]);
    const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.total }), {});

    const blocks = ACADEMIC_BLOCKS.map((block) => ({
      block,
      label: BLOCK_LABELS[block],
      totalQuestions: countMap[block] || 0
    }));

    res.json({ blocks });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los bloques.', error: err.message });
  }
});

// POST /api/questions/:id/check - checks a single answer, returns correctness + explanation
router.post('/:id/check', protect, async (req, res) => {
  try {
    const { selected } = req.body;
    if (typeof selected !== 'number') {
      return res.status(400).json({ message: 'Debes enviar el indice de la alternativa seleccionada (selected).' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Pregunta no encontrada.' });
    }

    const isCorrect = selected === question.correctAnswer;

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      selected
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al verificar la respuesta.', error: err.message });
  }
});

module.exports = router;
