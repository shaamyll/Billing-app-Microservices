FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY utils ./utils
COPY trip-service ./trip-service
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npm run prisma:generate -w trip-service

# Build shared package
RUN npm run build -w utils

# Build Trip Service
RUN npm run build -w trip-service

EXPOSE 3008

CMD ["node", "trip-service/dist/server.js"]
