/**
 * Script para crear profesores (usuarios student) de forma incremental.
 *
 * Uso:
 *   node server/seed/createStudents.js
 *
 * Reglas:
 *   - Si el correo YA existe → lo salta (no duplica, no modifica).
 *   - Si el correo NO existe → lo crea con rol 'student'.
 *   - Puedes editar el array STUDENTS y volver a ejecutar cuantas veces quieras.
 *
 * Ejemplo: agregas 2 profesores nuevos al array, ejecutas, y solo se crean esos 2.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const STUDENTS = [
  { name: 'Cinthya Trujillo Coral', email: 'tflowerpower520@gmail.com', password: 'Ascenso2026!' },
  { name: 'Mónica Tello', email: 'juroma13@gmail.com', password: 'Ascenso2026!' },
  { name: 'Norma Salas', email: 'normasalasch17@gmail.com', password: 'Ascenso2026!' },
  { name: 'Susana Valencia Inocente', email: 'winniami.susan@gmail.com', password: 'Ascenso2026!' }
];

async function createStudents() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Falta MONGODB_URI en .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('🔌 Conectado a MongoDB.\n');

  let creados = 0;
  let saltados = 0;

  for (const s of STUDENTS) {
    const exists = await User.findOne({ email: s.email.toLowerCase().trim() });
    if (exists) {
      console.log(`⏭️  Saltado (ya existe): ${s.name} <${s.email}>`);
      saltados++;
      continue;
    }

    await User.create({
      name: s.name.trim(),
      email: s.email.toLowerCase().trim(),
      password: s.password,
      role: 'student'
    });
    console.log(`✅ Creado: ${s.name} <${s.email}>`);
    creados++;
  }

  console.log(`\n📊 Resumen: ${creados} creados, ${saltados} saltados.`);
  await mongoose.disconnect();
}

createStudents().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
