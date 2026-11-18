import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { obtenerUsuarioDesdeRequest } from './auth.js';

const PORT = process.env.PORT || 4000;
// En Docker el host de Mongo es el NOMBRE del servicio ("mongo"), no localhost.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskhub';

// Mongo puede tardar unos segundos en arrancar dentro de Docker,
// por eso se reintenta la conexión en vez de caerse a la primera.
async function conectarMongo(intentos = 20) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('Conectado a MongoDB');
      return;
    } catch (err) {
      console.log(`MongoDB no está listo (intento ${i}/${intentos}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error('No se pudo conectar a MongoDB');
}

async function main() {
  await conectarMongo();

  const servidor = new ApolloServer({ typeDefs, resolvers });
  await servidor.start();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Ruta simple para comprobar que el contenedor está vivo.
  app.get('/health', (_, res) => res.json({ ok: true }));

  // Único endpoint GraphQL. El "context" decide quién es el usuario en cada petición.
  app.use(
    '/graphql',
    expressMiddleware(servidor, {
      context: async ({ req }) => ({ usuario: await obtenerUsuarioDesdeRequest(req) }),
    })
  );

  app.listen(PORT, '0.0.0.0', () => console.log(`API GraphQL en http://localhost:${PORT}/graphql`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
