FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY utils ./utils
COPY user-service ./user-service
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npm run prisma:generate -w user-service

# Build shared package
RUN npm run build -w utils

# Build User Service
RUN npm run build -w user-service

EXPOSE 3002

CMD ["node", "user-service/dist/server.js"]