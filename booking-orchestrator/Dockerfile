FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY utils ./utils
COPY booking-orchestrator ./booking-orchestrator
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Build shared package
RUN npm run build -w utils

# Build Booking Orchestrator
RUN npm run build -w booking-orchestrator

EXPOSE 3011

CMD ["node", "booking-orchestrator/dist/server.js"]
