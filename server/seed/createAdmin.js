/**
 * Script para crear (o promover) un usuario administrador.
 *
 * Uso:
 *   node server/seed/createAdmin.js "Nombre Apellido" correo@ejemplo.com contrasena123
 *
 * Si el correo ya existe, el usuario se promueve a rol "admin".
 * Si no existe, se crea uno nuevo con rol "admin".
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error('Uso: node server/seed/createAdmin.js "Nombre" correo@ejemplo.com contrasena');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta la variable de entorno MONGODB_URI. Revisa tu archivo .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Conectado a MongoDB.');

  let user = await User.findOne({ email: email.toLowerCase().trim() });

  if (user) {
    user.role = 'admin';
    await user.save();
    console.log(`El usuario ${user.email} ya existia y fue promovido a admin.`);
  } else {
    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin'
    });
    console.log(`Usuario admin creado: ${user.email}`);
  }

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('Error al crear el usuario admin:', err);
  process.exit(1);
});
