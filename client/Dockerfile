FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

FROM caddy:2-alpine
COPY --from=build-stage /app/dist/client/browser /usr/share/caddy
COPY ../Caddyfile /etc/caddy/Caddyfile