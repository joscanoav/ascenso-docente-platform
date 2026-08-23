const express = require('express');
const Attempt = require('../models/Attempt');
const { protect } = require('../middleware/auth');
const { ACADEMIC_BLOCKS, BLOCK_LABELS, percentage, round } = require('../utils/blocks');

const router = express.Router();

// GET /api/history - list of attempts for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user._id })
      .sort({ date: -1 })
      .select('-answers.question');
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el historial.', error: err.message });
  }
});

// GET /api/history/stats/dashboard - summary used by the teacher dashboard
// NOTE: this must be declared BEFORE the /:id route, otherwise Express would
// treat "stats" as an attempt id and this route would never be reached.
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user._id });

    const perBlock = {};
    ACADEMIC_BLOCKS.forEach((b) => {
      perBlock[b] = { attempts: 0, best: 0, sum: 0 };
    });

    let overallSum = 0;
    let overallCount = 0;

    attempts.forEach((a) => {
      overallSum += a.percentage;
      overallCount += 1;

      if (a.mode === 'practice' && a.block && perBlock[a.block]) {
        perBlock[a.block].attempts += 1;
        perBlock[a.block].sum += a.percentage;
        perBlock[a.block].best = Math.max(perBlock[a.block].best, a.percentage);
      }
      if (a.mode === 'mock_exam' && Array.isArray(a.blockBreakdown)) {
        a.blockBreakdown.forEach((bb) => {
          if (perBlock[bb.block]) {
            perBlock[bb.block].attempts += 1;
            perBlock[bb.block].sum += bb.percentage;
            perBlock[bb.block].best = Math.max(perBlock[bb.block].best, bb.percentage);
          }
        });
      }
    });

    const blocks = ACADEMIC_BLOCKS.map((b) => {
      const data = perBlock[b];
      const avg = data.attempts > 0 ? round(data.sum / data.attempts) : 0;
      return {
        block: b,
        label: BLOCK_LABELS[b],
        attempts: data.attempts,
        best: round(data.best),
        average: avg,
        progress: avg // progress bar reflects the average score achieved so far
      };
    });

    res.json({
      overallProgress: overallCount > 0 ? round(overallSum / overallCount) : 0,
      totalAttempts: overallCount,
      blocks
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al calcular las estadisticas.', error: err.message });
  }
});

// GET /api/history/:id - full detail of one attempt (with per-question answers)
router.get('/:id', protect, async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, userId: req.user._id })
      .populate({
        path: 'answers.question',
        select: 'text options explanation block skill legacyId _needsReview contextId contextRole contextStatus',
        populate: { path: 'context', select: 'contextType contextText' }
      });
    if (!attempt) {
      return res.status(404).json({ message: 'Intento no encontrado.' });
    }
    res.json({ attempt });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el detalle del intento.', error: err.message });
  }
});

module.exports = router;
