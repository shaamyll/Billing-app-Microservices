import dotenv from 'dotenv';
import express from 'express';

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
