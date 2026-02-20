FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Generate Prisma Client at build time
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3001

CMD ["npm", "start"]