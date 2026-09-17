FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY utils ./utils
COPY route-service ./route-service
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npm run prisma:generate -w route-service

# Build shared package
RUN npm run build -w utils

# Build Route Service
RUN npm run build -w route-service

EXPOSE 3007

CMD ["node", "route-service/dist/server.js"]
