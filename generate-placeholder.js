// This script generates Prisma client without requiring DATABASE_URL
// Used only during Docker build phase
const { execSync } = require('child_process');

try {
  // Set a dummy DATABASE_URL for build time
  process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
  
  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Prisma client generated successfully with placeholder URL');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error);
  process.exit(1);
}
