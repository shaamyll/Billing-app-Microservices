FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY utils ./utils
COPY booking-service ./booking-service
COPY tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npm run prisma:generate -w booking-service

# Build shared package
RUN npm run build -w utils

# Build Booking Service
RUN npm run build -w booking-service

EXPOSE 3009

CMD ["node", "booking-service/dist/server.js"]
