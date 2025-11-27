# frontend/Dockerfile

# 1) Build stage
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Accept build-time variable from Northflank (or docker build)
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

COPY package*.json ./
RUN npm ci
COPY . .

# VITE_API_BASE is read at build time here
RUN npm run build

# 2) Runtime stage: Nginx serves the static assets
FROM nginx:1.25-alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
