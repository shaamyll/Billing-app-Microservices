import { prisma } from './prisma'

export const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  const retryDelay = 3000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`🔄 Connecting to database (attempt ${attempt}/${maxRetries})...`);

      await prisma.$connect();
      
      // Verify connection
      await prisma.$queryRaw`SELECT 1`;
      
      console.log('✅ Database connection successful');
      return;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error instanceof Error ? error.message : error);

      if (attempt >= maxRetries) {
        throw new Error('Database connection failed after maximum retries');
      }

      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

export const closeDBConnection = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Prisma client disconnected');
  } catch (error) {
    console.error('❌ Error during disconnect:', error);
    throw error;
  }
};