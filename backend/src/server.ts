import 'dotenv/config';
import app from './app';
import prisma from './config/database';

const PORT = parseInt(process.env.PORT ?? '5000', 10);

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`\n🌾 AgriCore API`);
      console.log(`   Running at : http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received – shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
