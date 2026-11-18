import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from './models/User.js';

// El secreto se lee de una variable de entorno (nunca se escribe en el código).
const JWT_SECRET = process.env.JWT_SECRET || 'cambia-este-secreto-en-produccion';

// Crea un token válido por 7 días con el id del usuario.
export function firmarToken(usuario) {
  return jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '7d' });
}

// Se ejecuta en cada petición: lee el header "Authorization: Bearer <token>"
// y, si es válido, carga el usuario para que los resolvers sepan quién llama.
export async function obtenerUsuarioDesdeRequest(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    return await User.findById(payload.id);
  } catch {
    return null; // token inválido o vencido: se trata como no autenticado
  }
}

// Helper para proteger resolvers que exigen sesión iniciada.
export function exigirUsuario(contexto) {
  if (!contexto.usuario) {
    throw new GraphQLError('Debes iniciar sesión', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return contexto.usuario;
}
