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
    net-tools \
    iproute2 \
    procps \
    lsof \
    iputils-ping \
    telnet \
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
    chmod 700 /root/.config/dfx/identity/default && \
    mkdir -p /root/.quikdb && \
    chmod 700 /root/.quikdb

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install QuikDB CLI globally
RUN npm install -g quikdb-cli-beta

# Copy the rest of the application
COPY . .

# Copy environment file
COPY .dockerenv /usr/src/app/.env

# Build TypeScript
RUN npm run build

# Copy and prepare init script
COPY init-quikdb.sh /usr/src/app/
RUN chmod +x /usr/src/app/init-quikdb.sh && \
    sed -i 's/\r$//' /usr/src/app/init-quikdb.sh

# Expose ports
EXPOSE 3000 4943

# Add healthcheck with improved parameters
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
    CMD curl -sf http://127.0.0.1:4943/_/raw || curl -sf http://0.0.0.0:4943/_/raw || exit 1

# Use init script as entrypoint
ENTRYPOINT ["/usr/src/app/init-quikdb.sh"]