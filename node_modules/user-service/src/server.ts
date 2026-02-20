import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import { DataSource } from 'typeorm';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', service: 'user-service' });
});

app.listen(PORT, () => {
  console.log(` User Service running on port ${PORT}`);
});

// Database connection
// const AppDataSource = new DataSource({
//   type: 'postgres',
//   url: process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5432/billbox',
//   synchronize: true,
//   logging: false,
//   entities: ['src/entities/**/*.ts'],
//   migrations: ['src/migrations/**/*.ts'],
// });

// AppDataSource.initialize()
//   .then(() => {
//     console.log('Connected to PostgreSQL');
//     app.listen(PORT, () => {
//       console.log(`🔐 User Service running on port ${PORT}`);
//     });
//   })
//   .catch(error => console.error('Database connection error:', error));