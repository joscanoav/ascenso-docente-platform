const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta la variable de entorno MONGODB_URI. Revisa tu archivo .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado correctamente');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
