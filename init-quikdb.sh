#!/bin/bash
set -e

# Step 1: Configure QuikDB environment
echo "Configuring QuikDB environment..."
quikdb config -u $QUIKDB_USERNAME -e $QUIKDB_EMAIL

# Step 2: Install QuikDB SDK
echo "Installing QuikDB SDK..."
quikdb install

# Step 3: Verify Installation
echo "Verifying QuikDB installation..."
quikdb --version

# Start the application
 npm run dev
 
 
