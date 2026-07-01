FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY tsconfig.base.json ./
COPY api-gateway ./api-gateway
COPY utils ./utils

# Install workspace dependencies
RUN npm install

# Build shared package
RUN npm run build -w utils

# Build API Gateway
RUN npm run build -w api-gateway

EXPOSE 3000

CMD ["node", "api-gateway/dist/server.js"]