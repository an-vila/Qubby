FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

FROM caddy:2-alpine
RUN rm -rf /usr/share/caddy/*

COPY --from=build /app/dist/qubby/browser/ /usr/share/caddy/