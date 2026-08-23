require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const practiceRoutes = require('./routes/practice');
const mockExamRoutes = require('./routes/mockExam');
const historyRoutes = require('./routes/history');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/mock-exam', mockExamRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the built React app in production (single Render service)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
