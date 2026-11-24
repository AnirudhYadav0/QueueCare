# Multi-stage Dockerfile for QueueCare Production
# Stage 1: Build Frontend Client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runner
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server application
COPY server/ ./server/

# Copy compiled frontend from client-builder
COPY --from=client-builder /app/client/dist ./client/dist

# Expose HTTP & WebSocket port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
