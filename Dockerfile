FROM node:22-alpine

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Copy source code (including prisma schema & migrations)
COPY . .

# Build TypeScript -> JavaScript
RUN npm run build

# Copy and prepare entrypoint script
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
# Cloud Run injects PORT; default to 8080
ENV PORT=8080

# Expose the port for local testing (Cloud Run ignores EXPOSE but it's harmless)
EXPOSE 8080

# Ensure Prisma runs before the app starts
ENTRYPOINT ["./docker-entrypoint.sh"]



