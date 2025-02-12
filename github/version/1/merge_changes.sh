#!/bin/bash

# Verify Node.js installation
node -v
npm -v

# Initialize Node.js project and install dependencies
echo "Initializing Node.js project and installing dependencies..."
npm init -y
npm install axios js-yaml

echo "Node.js and dependencies installed successfully."

# Ensure the scripts directory exists
[ -d scripts ] || mkdir scripts

# Fetch the correct version file from S3
VERSION=$3
curl -o scripts/yaml_json.js "https://raw.githubusercontent.com/Digia-Technology-Private-Limited/digia_public_scripts/refs/heads/main/github/version/$VERSION/yaml_json.js"
chmod +x scripts/yaml_json.js

# Run the script with provided arguments
projectId=$1
branchName=$2

node scripts/yaml_json.js "$projectId" "$branchName" 

# Cleanup
chmod -R 777 node_modules package.json package-lock.json scripts/yaml_json.js
rm -rf node_modules package.json package-lock.json scripts/yaml_json.js
