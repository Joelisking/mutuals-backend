import app from './app';
import { env } from './common/config/env.config';
import { initRedis, closeRedis } from './common/config/redis.config';

const PORT = env.PORT || 5000;

// Initialize Redis
initRedis();

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Mutuals+ API Server`);
  console.log(`=================================`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Server running on port: ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api/${env.API_VERSION}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log('=================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(async () => {
    await closeRedis();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(async () => {
    await closeRedis();
    console.log('💥 Process terminated!');
  });
});

export default server;
