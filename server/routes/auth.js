const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contrasena son obligatorios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contrasena debe tener al menos 6 caracteres.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe una cuenta registrada con ese correo.' });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = signToken(user);

    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar el usuario.', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contrasena son obligatorios.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Credenciales invalidas.' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesion.', error: err.message });
  }
});

module.exports = router;
