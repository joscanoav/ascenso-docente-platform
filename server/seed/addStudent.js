/**
 * Script para agregar UN solo profesor sin editar listas.
 *
 * Uso:
 *   node server/seed/addStudent.js "Nombre Apellido" correo@ejemplo.com Contraseña123
 *
 * Si el correo ya existe, lo salta.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function addStudent() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error('Uso: node server/seed/addStudent.js "Nombre" correo@ejemplo.com Contraseña');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Falta MONGODB_URI en .env');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    console.log(`⏭️  Ya existe: ${email}`);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: 'student'
  });

  console.log(`✅ Profesor agregado: ${name} <${email}>`);
  await mongoose.disconnect();
}

addStudent().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
