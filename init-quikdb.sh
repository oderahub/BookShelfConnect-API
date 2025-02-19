#!/bin/bash
set -e

# Function to log messages with timestamps
log() {
    local level=$1
    local message=$2
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [${level}] ${message}"
}

# Enhanced DFX status check function
check_dfx_running() {
    local max_wait=30
    local count=0
    
    while [ $count -lt $max_wait ]; do
        # Check all required processes
        if ! pgrep -f "dfx start" > /dev/null; then
            log "DEBUG" "DFX process not running"
            sleep 2
            count=$((count + 1))
            continue
        fi
        
        if ! pgrep -f "replica" > /dev/null; then
            log "DEBUG" "Replica process not running"
            sleep 2
            count=$((count + 1))
            continue
        fi
        
        # Check port bindings
        if ! netstat -tulpn | grep -q ":4943.*LISTEN"; then
            log "DEBUG" "Port 4943 not listening"
            sleep 2
            count=$((count + 1))
            continue
        fi
        
        # Try the actual DFX endpoint
        if curl -sf "http://127.0.0.1:4943/_/raw" > /dev/null 2>&1; then
            log "INFO" "DFX is running and responding"
            return 0
        fi
        
        log "DEBUG" "Waiting for DFX endpoint to respond..."
        sleep 2
        count=$((count + 1))
    done
    
    return 1
}

# Validate environment variables
log "DEBUG" "Validating environment variables..."
required_vars=("QUIKDB_USERNAME" "QUIKDB_EMAIL" "QUIKDB_PASSWORD" "QUIKDB_PRINCIPAL_ID" "QUIKDB_PROJECT_TOKEN_REF")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log "ERROR" "$var is not set"
        exit 1
    fi
    log "DEBUG" "$var is set"
done

# Clean up any existing DFX processes and state
log "INFO" "Cleaning up existing DFX processes..."
pkill -f "dfx start" || true
pkill -f "replica" || true
pkill -f "ic-starter" || true
pkill -f "icx-proxy" || true
lsof -ti:4943 | xargs kill -9 || true
rm -rf /root/.dfx/network-data || true
rm -rf .dfx || true
sleep 5

# Set up DFX configuration directory
log "INFO" "Setting up DFX configuration..."
mkdir -p /root/.config/dfx
mkdir -p .dfx

# Create dfx.json if it doesn't exist
cat > dfx.json << EOF
{
  "canisters": {},
  "defaults": {
    "build": {
      "packtool": "",
      "args": ""
    }
  },
  "networks": {
    "local": {
      "bind": "0.0.0.0:4943",
      "type": "ephemeral"
    }
  },
  "version": 1
}
EOF

# Initialize DFX identity
log "INFO" "Initializing DFX identity..."
if [ ! -f "/root/.config/dfx/identity/default/identity.pem" ]; then
    dfx identity new default --storage-mode=plaintext
fi
dfx identity use default

# Check port availability
if lsof -i:4943 > /dev/null 2>&1; then
    log "ERROR" "Port 4943 is already in use"
    lsof -i:4943
    exit 1
fi

# Start dfx with debug mode and wait for full initialization
log "INFO" "Starting dfx..."
export DFX_DEBUG=1
DFX_BIND_ADDRESS="0.0.0.0:4943" dfx start --clean --background

# Initial delay to allow processes to start
log "INFO" "Waiting for initial process startup..."
sleep 15

# Wait for DFX to be ready
log "INFO" "Waiting for DFX to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! check_dfx_running; do
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        log "ERROR" "DFX failed to start after $MAX_RETRIES attempts"
        log "DEBUG" "Process status:"
        ps aux | grep -E "dfx|replica|icx-proxy" | grep -v grep
        log "DEBUG" "Network status:"
        netstat -tulpn
        log "DEBUG" "DFX logs:"
        find /root/.dfx -name "*.log" -exec cat {} \;
        exit 1
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log "INFO" "Waiting for DFX to start... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 5
done

log "INFO" "DFX is ready!"

# Configure QuikDB
log "INFO" "Configuring QuikDB environment..."
mkdir -p /root/.quikdb
chmod 700 /root/.quikdb
cat > /root/.quikdb/config << EOF
{
    "email": "${QUIKDB_EMAIL}",
    "username": "${QUIKDB_USERNAME}",
    "projectTokenRef": "${QUIKDB_PROJECT_TOKEN_REF}",
    "password": "${QUIKDB_PASSWORD}",
    "principalId": "${QUIKDB_PRINCIPAL_ID}"
}
EOF
chmod 600 /root/.quikdb/config

# Create local canister
log "INFO" "Creating local canister..."
dfx canister create --all

# Install QuikDB SDK
log "INFO" "Installing QuikDB SDK..."
expect << EOF
    set timeout 60
    spawn quikdb install
    expect {
        "Please enter your account password:" {
            send "${QUIKDB_PASSWORD}\r"
            exp_continue
        }
        "QuikDB runs on dfx VM. Do you want to proceed with the installation? (yes/no):" {
            send "yes\r"
            exp_continue
        }
        eof
    }
EOF

if [ $? -ne 0 ]; then
    log "ERROR" "QuikDB installation failed"
    exit 1
fi

# Initialize QuikDB
log "INFO" "Initializing QuikDB..."
quikdb init

# Start the application
log "INFO" "Starting the application..."
exec npm run start