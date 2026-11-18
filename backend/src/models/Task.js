import mongoose from 'mongoose';

// Modelo de tarea. Cada tarea pertenece a un usuario (campo "usuario"),
// así cada persona solo ve y modifica sus propias tareas.
const taskSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '', trim: true },
    completada: { type: Boolean, default: false },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
