// Configuración de Vite (solo para desarrollo local sin Docker).
// El proxy reenvía /graphql al backend, igual que hace nginx dentro de Docker,
// así el código del frontend es el mismo en ambos casos y no hay problemas de CORS.
export default {
  server: {
    port: 5173,
    proxy: { '/graphql': 'http://localhost:4000' },
  },
};
