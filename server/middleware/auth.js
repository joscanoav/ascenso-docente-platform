const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'No autorizado. Falta el token de acceso.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'No autorizado. Usuario no encontrado.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'No autorizado. Token invalido o expirado.' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso restringido a administradores.' });
  }
  next();
}

module.exports = { protect, adminOnly };
