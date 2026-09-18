FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY utils ./utils
COPY payment-service ./payment-service
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npm run prisma:generate -w payment-service

# Build shared package
RUN npm run build -w utils

# Build Payment Service
RUN npm run build -w payment-service

EXPOSE 3010

CMD ["node", "payment-service/dist/server.js"]
