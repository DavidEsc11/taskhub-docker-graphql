import axios from 'axios';

// Cliente Axios único. La URL es relativa ("/graphql"): en Docker la resuelve nginx
// y en desarrollo la resuelve el proxy de Vite.
const cliente = axios.create({ baseURL: '/graphql' });

// Interceptor: antes de cada petición agrega el token JWT guardado (si existe).
cliente.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// GraphQL siempre responde 200 con un campo "errors" si algo falla,
// así que lo convertimos en una excepción normal de JavaScript.
export async function gql(query, variables = {}) {
  const { data } = await cliente.post('', { query, variables });
  if (data.errors && data.errors.length) throw new Error(data.errors[0].message);
  return data.data;
}

// --- Operaciones del backend ---
export const registrar = (nombre, email, password) =>
  gql(
    `mutation($nombre:String!,$email:String!,$password:String!){
      registrar(nombre:$nombre,email:$email,password:$password){ token usuario{ id nombre email } }
    }`,
    { nombre, email, password }
  ).then((d) => d.registrar);

export const login = (email, password) =>
  gql(
    `mutation($email:String!,$password:String!){
      login(email:$email,password:$password){ token usuario{ id nombre email } }
    }`,
    { email, password }
  ).then((d) => d.login);

export const listarTareas = () =>
  gql(`query{ tareas{ id titulo descripcion completada createdAt } }`).then((d) => d.tareas);

export const crearTarea = (titulo, descripcion) =>
  gql(
    `mutation($titulo:String!,$descripcion:String){
      crearTarea(titulo:$titulo,descripcion:$descripcion){ id }
    }`,
    { titulo, descripcion }
  );

export const alternarTarea = (id) =>
  gql(`mutation($id:ID!){ alternarTarea(id:$id){ id completada } }`, { id });

export const eliminarTarea = (id) =>
  gql(`mutation($id:ID!){ eliminarTarea(id:$id) }`, { id });
