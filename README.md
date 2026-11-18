# TaskHub: Docker + GraphQL + Axios + MongoDB

Gestor de tareas con registro e inicio de sesión. Proyecto de la actividad *Integración Completa con Docker, GraphQL, Axios y MongoDB*.

| Capa | Tecnología | Qué hace |
|---|---|---|
| Base de datos | **MongoDB 7** (con Mongoose) | Guarda usuarios y tareas |
| Backend | **Node.js + Express + Apollo Server (GraphQL)** | API en un solo endpoint `/graphql`, autenticación con JWT y contraseñas con bcrypt |
| Frontend | **JavaScript + Vite + Axios** | Pantalla de login/registro y lista de tareas; Axios envía las consultas GraphQL |
| Contenedores | **Docker + Docker Compose** | Levanta los 3 servicios con un solo comando |

## Arquitectura

```
Navegador ──► frontend (nginx :80 → publicado en :8080)
                 │  /graphql  (proxy interno)
                 ▼
             backend (Node :4000) ──► mongo (MongoDB :27017)
```

Los tres contenedores comparten una red de Docker y se encuentran por el **nombre del servicio** (`backend`, `mongo`). Los datos de MongoDB se guardan en un volumen (`mongo_data`).

## Cómo ejecutarlo con Docker (recomendado)

Requisitos: Docker y Docker Compose.

```bash
git clone <URL-DE-ESTE-REPOSITORIO>
cd <carpeta-del-repositorio>
cp .env.example .env        # y cambia JWT_SECRET por una frase larga
docker compose up --build
```

- Aplicación: http://localhost:8080
- API GraphQL directa: http://localhost:4000/graphql
- Para detener: `Ctrl + C` y luego `docker compose down` (agrega `-v` si quieres borrar también los datos).

### Si tu computador no puede ejecutar Docker (sin virtualización)

El repositorio incluye `.devcontainer/`. Abre el repositorio en **GitHub Codespaces** (botón verde *Code* → *Codespaces* → *Create*): ya trae Docker instalado y puedes ejecutar `docker compose up --build` dentro del navegador. El puerto 8080 se abre desde la pestaña *Ports*.

## Ejecutarlo sin Docker (desarrollo)

Necesitas Node 22 y un MongoDB local (o una URI de MongoDB Atlas).

```bash
# Terminal 1: backend
cd backend
npm install
MONGO_URI="mongodb://localhost:27017/taskhub" JWT_SECRET="secreto" npm start

# Terminal 2: frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## API GraphQL

```graphql
# Registro / login (devuelven un token JWT)
mutation { registrar(nombre: "Ana", email: "ana@mail.com", password: "123456") { token usuario { id nombre } } }
mutation { login(email: "ana@mail.com", password: "123456") { token } }

# Con el header  Authorization: Bearer <token>
query    { tareas { id titulo completada } }
mutation { crearTarea(titulo: "Estudiar Docker") { id } }
mutation { alternarTarea(id: "...") { completada } }
mutation { eliminarTarea(id: "...") }
```

## Estructura

```
backend/   src/index.js (servidor y conexión a Mongo)
           src/schema.js (tipos GraphQL)  src/resolvers.js (lógica)
           src/auth.js (JWT)  src/models/ (User, Task)  Dockerfile
frontend/  src/api.js (Axios + operaciones)  src/main.js (pantallas)
           nginx.conf  Dockerfile
docker-compose.yml   .devcontainer/   .env.example
```

## Decisiones de diseño (también están comentadas en el código)

- **Dockerfile en etapas**: la imagen final solo contiene lo necesario para ejecutar (más liviana y segura).
- **nginx como proxy**: el frontend llama a `/graphql` con una ruta relativa; nginx la reenvía al backend. Así no hay problemas de CORS y el mismo código sirve en Docker y en desarrollo.
- **Reintentos de conexión a MongoDB**: Mongo puede tardar en arrancar; el backend reintenta en vez de caerse.
- **Seguridad**: contraseñas con bcrypt, sesión con JWT y cada consulta de tareas filtra por el usuario dueño. El secreto JWT sale de una variable de entorno.
