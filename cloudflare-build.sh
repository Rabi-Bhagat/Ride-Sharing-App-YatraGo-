#!/usr/bin/env bash
# Cloudflare Pages build helper for the repo-root configuration.
# Use this as the build command while Root directory is left as the repo root:
#   bash cloudflare-build.sh
# Output directory: frontend/dist
set -euo pipefail

echo "Node version: $(node -v)"
echo "npm version:  $(npm -v)"

# Cloudflare sets NODE_ENV=production, which makes npm skip devDependencies.
# Vite/Tailwind/PostCSS live in devDependencies, so force them in.
if [ -f frontend/package-lock.json ]; then
  echo "Installing frontend dependencies (including devDependencies)..."
  npm --prefix frontend ci --include=dev --include=optional
else
  echo "Installing frontend dependencies (including devDependencies)..."
  npm --prefix frontend install --include=dev
fi

echo "Building frontend..."
npm --prefix frontend run build

echo "Build complete. Output: frontend/dist"
