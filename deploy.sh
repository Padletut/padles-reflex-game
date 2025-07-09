#!/bin/bash
# Quick deploy script for GitHub
# Usage: ./deploy.sh YOUR_USERNAME YOUR_REPO_NAME

if [ $# -ne 2 ]; then
    echo "Usage: $0 <github_username> <repository_name>"
    echo "Example: $0 john-doe reflex-game"
    exit 1
fi

USERNAME=$1
REPO_NAME=$2

echo "🚀 Deploying Reflex Game to GitHub..."
echo "Repository: https://github.com/$USERNAME/$REPO_NAME"

# Add remote origin
git remote add origin https://github.com/$USERNAME/$REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main

echo "✅ Successfully deployed to GitHub!"
echo "🌐 Your repo: https://github.com/$USERNAME/$REPO_NAME"
echo "🎯 Enable GitHub Pages for live demo!"
