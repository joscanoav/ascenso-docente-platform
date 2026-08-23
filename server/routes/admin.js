const express = require('express');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const { protect, adminOnly } = require('../middleware/auth');
const { ACADEMIC_BLOCKS, BLOCK_LABELS, round } = require('../utils/blocks');

const router = express.Router();

// GET /api/admin/teachers - table of teachers with activity & per-block results
router.get('/teachers', protect, adminOnly, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    const teacherIds = teachers.map((t) => t._id);
    const attempts = await Attempt.find({ userId: { $in: teacherIds } });

    const byUser = new Map();
    attempts.forEach((a) => {
      const key = a.userId.toString();
      if (!byUser.has(key)) byUser.set(key, []);
      byUser.get(key).push(a);
    });

    const rows = teachers.map((t) => {
      const userAttempts = byUser.get(t._id.toString()) || [];
      const perBlock = {};
      ACADEMIC_BLOCKS.forEach((b) => { perBlock[b] = { attempts: 0, sum: 0, best: 0 }; });

      let overallSum = 0;
      userAttempts.forEach((a) => {
        overallSum += a.percentage;
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

      const blocks = ACADEMIC_BLOCKS.map((b) => ({
        block: b,
        label: BLOCK_LABELS[b],
        attempts: perBlock[b].attempts,
        average: perBlock[b].attempts > 0 ? round(perBlock[b].sum / perBlock[b].attempts) : 0,
        best: round(perBlock[b].best)
      }));

      return {
        id: t._id,
        name: t.name,
        email: t.email,
        createdAt: t.createdAt,
        totalAttempts: userAttempts.length,
        overallAverage: userAttempts.length > 0 ? round(overallSum / userAttempts.length) : 0,
        lastActivity: userAttempts.length > 0
          ? userAttempts.reduce((latest, a) => (a.date > latest ? a.date : latest), userAttempts[0].date)
          : null,
        blocks
      };
    });

    res.json({ teachers: rows });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la actividad de los profesores.', error: err.message });
  }
});

// GET /api/admin/teachers/:id/attempts - full attempt history for one teacher
router.get('/teachers/:id/attempts', protect, adminOnly, async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id).select('-password');
    if (!teacher || teacher.role !== 'student') {
      return res.status(404).json({ message: 'Profesor no encontrado.' });
    }
    const attempts = await Attempt.find({ userId: teacher._id }).sort({ date: -1 }).select('-answers.question');
    res.json({ teacher, attempts });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el detalle del profesor.', error: err.message });
  }
});

module.exports = router;
