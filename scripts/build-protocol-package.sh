#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_JSON="$ROOT_DIR/package.json"
LOCKFILE="$ROOT_DIR/package-lock.json"
NODE_MODULES_LOCK="$ROOT_DIR/node_modules/.package-lock.json"

usage() {
  cat <<'EOF'
Usage: bash scripts/build-protocol-package.sh

Install Dexly Protocol dependencies when needed, then build the shared
@dexly/protocol package into dist/.
EOF
}

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing required command: $command_name" >&2
    exit 1
  fi
}

needs_install() {
  if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
    return 0
  fi

  if [[ ! -f "$NODE_MODULES_LOCK" ]]; then
    return 0
  fi

  if [[ "$LOCKFILE" -nt "$NODE_MODULES_LOCK" ]]; then
    return 0
  fi

  if [[ "$PACKAGE_JSON" -nt "$NODE_MODULES_LOCK" ]]; then
    return 0
  fi

  return 1
}

main() {
  if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
    exit 0
  fi

  require_command node
  require_command npm

  cd "$ROOT_DIR"

  if needs_install; then
    echo "Installing Dexly Protocol dependencies..."
    npm install
  else
    echo "Using existing Dexly Protocol dependencies."
  fi

  echo "Building Dexly Protocol..."
  npm run build
}

main "$@"
