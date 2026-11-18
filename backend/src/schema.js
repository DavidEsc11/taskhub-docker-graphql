// Esquema GraphQL: describe los tipos de datos y las operaciones disponibles.
// A diferencia de REST, el cliente pide exactamente los campos que necesita
// en un único endpoint (/graphql).
export const typeDefs = `#graphql
  type Usuario {
    id: ID!
    nombre: String!
    email: String!
  }

  type Tarea {
    id: ID!
    titulo: String!
    descripcion: String
    completada: Boolean!
    createdAt: String!
  }

  # Respuesta de registrar/login: el token JWT y los datos del usuario
  type AuthPayload {
    token: String!
    usuario: Usuario!
  }

  type Query {
    # Devuelve el usuario autenticado (requiere token)
    yo: Usuario
    # Lista las tareas del usuario autenticado
    tareas: [Tarea!]!
  }

  type Mutation {
    registrar(nombre: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    crearTarea(titulo: String!, descripcion: String): Tarea!
    alternarTarea(id: ID!): Tarea!
    eliminarTarea(id: ID!): Boolean!
  }
`;
