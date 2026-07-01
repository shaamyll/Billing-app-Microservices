FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

COPY utils ./utils
COPY user-service ./user-service

RUN npm install

# Generate Prisma Client
RUN npx prisma generate --schema=user-service/prisma

# Build packages
RUN npm run build -w utils
RUN npm run build -w user-service

EXPOSE 3002

CMD ["node", "user-service/dist/server.js"]