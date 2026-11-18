# Dockerfile del backend (idea vista en el video: construir la imagen en pasos
# y dejar la imagen final lo más liviana posible).

# Paso 1: instalar dependencias de producción
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Paso 2: imagen final, solo con lo necesario para ejecutar
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
EXPOSE 4000
CMD ["node", "src/index.js"]
