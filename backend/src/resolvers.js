import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { firmarToken, exigirUsuario } from './auth.js';

// Convierte un documento de Mongo al formato que espera el esquema GraphQL.
const aTarea = (t) => ({
  id: t.id,
  titulo: t.titulo,
  descripcion: t.descripcion,
  completada: t.completada,
  createdAt: t.createdAt.toISOString(),
});

const aUsuario = (u) => ({ id: u.id, nombre: u.nombre, email: u.email });

export const resolvers = {
  Query: {
    yo: (_, __, ctx) => (ctx.usuario ? aUsuario(ctx.usuario) : null),

    tareas: async (_, __, ctx) => {
      const usuario = exigirUsuario(ctx);
      const tareas = await Task.find({ usuario: usuario.id }).sort({ createdAt: -1 });
      return tareas.map(aTarea);
    },
  },

  Mutation: {
    registrar: async (_, { nombre, email, password }) => {
      if (password.length < 6) {
        throw new GraphQLError('La contraseña debe tener al menos 6 caracteres');
      }
      const existe = await User.findOne({ email: email.toLowerCase() });
      if (existe) throw new GraphQLError('Ese correo ya está registrado');

      // bcrypt agrega una "sal" aleatoria y guarda solo el hash.
      const passwordHash = await bcrypt.hash(password, 10);
      const usuario = await User.create({ nombre, email, passwordHash });
      return { token: firmarToken(usuario), usuario: aUsuario(usuario) };
    },

    login: async (_, { email, password }) => {
      const usuario = await User.findOne({ email: email.toLowerCase() });
      // Mismo mensaje para correo o clave incorrectos: no revela cuál falló.
      const ok = usuario && (await bcrypt.compare(password, usuario.passwordHash));
      if (!ok) throw new GraphQLError('Correo o contraseña incorrectos');
      return { token: firmarToken(usuario), usuario: aUsuario(usuario) };
    },

    crearTarea: async (_, { titulo, descripcion }, ctx) => {
      const usuario = exigirUsuario(ctx);
      const tarea = await Task.create({ titulo, descripcion: descripcion || '', usuario: usuario.id });
      return aTarea(tarea);
    },

    alternarTarea: async (_, { id }, ctx) => {
      const usuario = exigirUsuario(ctx);
      // Se busca por id Y por dueño: nadie puede tocar tareas ajenas.
      const tarea = await Task.findOne({ _id: id, usuario: usuario.id });
      if (!tarea) throw new GraphQLError('Tarea no encontrada');
      tarea.completada = !tarea.completada;
      await tarea.save();
      return aTarea(tarea);
    },

    eliminarTarea: async (_, { id }, ctx) => {
      const usuario = exigirUsuario(ctx);
      const res = await Task.deleteOne({ _id: id, usuario: usuario.id });
      return res.deletedCount === 1;
    },
  },
};
