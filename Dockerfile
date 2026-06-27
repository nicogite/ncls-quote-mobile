# --- Build du front Vue/Ionic (Vite) ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL est figé au build (Vite inline import.meta.env) : on pointe sur le
# même domaine, Traefik relaie ensuite /api vers l'API Render.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Service statique via NGINX ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
