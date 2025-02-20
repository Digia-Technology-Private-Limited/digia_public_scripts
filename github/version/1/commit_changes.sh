#!/bin/bash

set -e  


echo "🔍 Checking Node.js and npm versions..."
node -v
npm -v

echo "📦 Initializing Node.js project and installing dependencies..."
npm init -y
npm install axios js-yaml

echo "✅ Node.js and dependencies installed successfully."


[ -d scripts ] || mkdir scripts

branchName=$1
VERSION=$2

SCRIPT_URL="https://raw.githubusercontent.com/Digia-Technology-Private-Limited/digia_public_scripts/refs/heads/main/github/version/$VERSION/yaml_json.js"
TARGET_FILE="scripts/yaml_json.js"


echo "⬇️ Downloading script from $SCRIPT_URL..."
if ! curl -f -o "$TARGET_FILE" "$SCRIPT_URL"; then
  echo "❌ Error: Failed to download yaml_json.js script."
  exit 1
fi

chmod +x "$TARGET_FILE"


echo "🚀 Running Node.js script: $TARGET_FILE with branchName: $branchName..."
if ! node "$TARGET_FILE" "$branchName"; then
  echo "❌ Error: Node.js script execution failed."
  exit 1
fi


echo "🧹 Cleaning up temporary files..."
chmod -R 777 node_modules package.json package-lock.json "$TARGET_FILE" merge_changes.sh || true
rm -rf node_modules package.json package-lock.json "$TARGET_FILE" merge_changes.sh || true

echo "✅ Script execution completed successfully."
