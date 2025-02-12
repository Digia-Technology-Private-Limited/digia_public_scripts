#!/bin/bash

# Verify Node.js installation
node -v
npm -v

# Initialize Node.js project and install dependencies
echo "Initializing Node.js project and installing dependencies..."
npm init -y
npm install axios js-yaml

echo "Node.js and dependencies installed successfully."

[ -d scripts ] || mkdir scripts
curl -o scripts/yaml_json.js "https://digia-backend-files.s3.ap-south-1.amazonaws.com/github-scripts/version/$VERSION/yaml_json.js"
chmod +x scripts/yaml_json.js

projectId=$1
baseBranch=$2

node scripts/yaml_json.js $1 $2

sudo chmod -R 777 node_modules package.json package-lock.json scripts/yaml_json.js
sudo rm -rf node_modules package.json package-lock.json scripts/yaml_json.js