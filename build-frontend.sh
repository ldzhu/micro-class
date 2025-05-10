#!/bin/bash
set -euo pipefail

# Configuration
readonly FRONTEND_DIR="frontend"
readonly DIST_DIR="${FRONTEND_DIR}/dist"
readonly BACKEND_PUBLIC="backend/public"

# Check required directories
if [ ! -d "${FRONTEND_DIR}" ]; then
  echo "Error: Frontend directory not found" >&2
  exit 1
fi

if [ ! -d "${BACKEND_PUBLIC}" ]; then
  mkdir -p "${BACKEND_PUBLIC}"
fi

# Build frontend
echo "Building frontend..."
(cd "${FRONTEND_DIR}" && npm run build) || {
  echo "Frontend build failed with code: $?" >&2
  exit 1
}

# Sync dist to backend/public
echo "Syncing files..."
rsync -a --delete "${DIST_DIR}/" "${BACKEND_PUBLIC}/" || {
  echo "File sync failed with code: $?" >&2
  exit 1
}

echo "Frontend build completed."
