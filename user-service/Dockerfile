FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspaces
COPY utils ./utils
COPY user-service ./user-service

# Install dependencies
RUN npm install

# Build workspaces
RUN npm run build -w utils
RUN npm run build -w user-service

# Expose service port
EXPOSE 3002

# Run compiled user service
CMD ["node", "user-service/dist/server.js"]