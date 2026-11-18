# Dockerfile del frontend en dos etapas (build + publish), como en el video:
# la primera compila, la segunda solo se queda con el resultado.

# Etapa 1: compilar el frontend con Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: servir los archivos compilados con nginx (imagen final muy liviana)
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
