#!/usr/bin/env bash
set -e

echo "=== Building Minimi Angular App for Production ==="
npm run build -- --base-href "/online/"

DIST_DIR="dist/minimi-app/browser"
if [ ! -d "$DIST_DIR" ]; then
  DIST_DIR="dist/minimi-app"
fi

echo "=== Deploying static pages to target repo 'online' ==="
cd "$DIST_DIR"

touch .nojekyll

git init
git config user.name "Minimi Deployer"
git config user.email "deployer@minimi.local"
git add -A
git commit -m "deploy: static build $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
git branch -M main

TARGET_REPO_URL="${1:-git@github.com:areyouroot/online.git}"
echo "Pushing to $TARGET_REPO_URL..."
git push -f "$TARGET_REPO_URL" main:gh-pages

echo "=== Deployment to 'online' repository complete! ==="
