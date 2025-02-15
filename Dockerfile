FROM node:18-alpine

# Install required system dependencies
RUN apk add --no-cache python3 make g++ curl bash

# Install QuikDB CLI globally
RUN npm install -g quikdb-cli-beta

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build TypeScript
RUN npm run build

# Make init script executable
COPY init-quikdb.sh /usr/src/app/init-quikdb.sh
RUN chmod +x /usr/src/app/init-quikdb.sh

# Expose port
EXPOSE 3000

# Use init script as entrypoint
ENTRYPOINT ["/usr/src/app/init-quikdb.sh"]