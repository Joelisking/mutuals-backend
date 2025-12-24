FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (use package*.json for npm@5+)
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Build TypeScript -> JavaScript
RUN npm run build

# Cloud Run will inject PORT; default to 8080 for local use if not set
ENV PORT=8080

# Expose the port for local testing (Cloud Run ignores EXPOSE but it's harmless)
EXPOSE 8080

# Start the server (this will also run Prisma migrations as defined in package.json)
CMD ["npm", "run", "start"]


