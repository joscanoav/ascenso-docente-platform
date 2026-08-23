require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Context = require('../models/Context');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta la variable de entorno MONGODB_URI. Revisa tu archivo .env');
    process.exit(1);
  }

  const shouldReset = process.argv.includes('--reset');

  await mongoose.connect(uri);
  console.log('Conectado a MongoDB para el seed.');

  const dataPath = path.join(__dirname, 'data', 'bank.json');
  const bank = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const { contexts = [], questions = [] } = bank;
  console.log(`Cargando ${contexts.length} contextos y ${questions.length} preguntas desde ${dataPath}`);

  if (shouldReset) {
    const qResult = await Question.deleteMany({});
    const cResult = await Context.deleteMany({});
    console.log(`--reset: se eliminaron ${qResult.deletedCount} preguntas y ${cResult.deletedCount} contextos existentes.`);
  }

  // --- Contexts first, so every question's contextId can resolve once questions are upserted ---
  let ctxInserted = 0;
  let ctxUpdated = 0;
  let ctxUnchanged = 0;

  for (const c of contexts) {
    const result = await Context.updateOne(
      { contextId: c.contextId },
      { $set: c },
      { upsert: true }
    );
    if (result.upsertedCount > 0) ctxInserted += 1;
    else if (result.modifiedCount > 0) ctxUpdated += 1;
    else ctxUnchanged += 1;
  }

  // --- Questions: idempotency key is legacyId, same as before ---
  let qInserted = 0;
  let qUpdated = 0;
  let qUnchanged = 0;

  for (const q of questions) {
    const result = await Question.updateOne(
      { legacyId: q.legacyId },
      { $set: q },
      { upsert: true }
    );
    if (result.upsertedCount > 0) qInserted += 1;
    else if (result.modifiedCount > 0) qUpdated += 1;
    else qUnchanged += 1;
  }

  const totalQuestions = await Question.countDocuments();
  const totalContexts = await Context.countDocuments();

  console.log('--- Resumen del seed ---');
  console.log(`Contextos  -> insertados: ${ctxInserted}, actualizados: ${ctxUpdated}, sin cambios: ${ctxUnchanged}, total en BD: ${totalContexts}`);
  console.log(`Preguntas  -> insertadas: ${qInserted}, actualizadas: ${qUpdated}, sin cambios: ${qUnchanged}, total en BD: ${totalQuestions}`);

  await mongoose.disconnect();
  console.log('Seed finalizado.');
}

seed().catch((err) => {
  console.error('Error al ejecutar el seed:', err);
  process.exit(1);
});
