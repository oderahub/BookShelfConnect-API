# Use Node.js 18 on Ubuntu as the base image
FROM node:18

# Install required system dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    bash \
    perl \
    coreutils \
    expect \
    libunwind8 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install DFX (DFINITY SDK)
RUN curl -fsSL -o dfx.tar.gz "https://github.com/dfinity/sdk/releases/download/0.15.3/dfx-0.15.3-x86_64-linux.tar.gz" && \
    tar -xzf dfx.tar.gz -C /usr/local/bin && \
    rm dfx.tar.gz && \
    chmod +x /usr/local/bin/dfx

# Set working directory
WORKDIR /usr/src/app

# Create necessary directories and set permissions
RUN mkdir -p /root/.config/dfx/identity/default && \
    mkdir -p /root/.cache/dfinity && \
    chmod 700 /root/.config/dfx/identity/default

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install QuikDB CLI globally
RUN npm install -g quikdb-cli-beta

# Copy the rest of the application
COPY . .

# Create QuikDB directory
RUN mkdir -p /root/.quikdb

# Build TypeScript
RUN npm run build

# Make init script executable
COPY init-quikdb.sh /usr/src/app/
RUN chmod +x /usr/src/app/init-quikdb.sh

# Expose ports
EXPOSE 3000 4943

# Use init script as entrypoint
ENTRYPOINT ["/usr/src/app/init-quikdb.sh"]