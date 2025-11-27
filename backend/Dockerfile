# backend/Dockerfile
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Only install prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Northflank will set PORT; default to 4000 for local
ENV PORT=4000
EXPOSE 4000

# Start
CMD ["node", "src/index.js"]
