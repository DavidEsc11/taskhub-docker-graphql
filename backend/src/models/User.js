import mongoose from 'mongoose';

// Modelo de usuario. El correo es único para no permitir cuentas duplicadas.
// Guardamos solo el hash de la contraseña, nunca la contraseña en texto plano.
const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
