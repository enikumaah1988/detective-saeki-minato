#!/bin/sh
set -eu
port=${1:-5187}
case "$port" in ''|*[!0-9]*) echo 'Port must be a number from 1 to 65535.' >&2; exit 1;; esac
if [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    echo 'Port must be a number from 1 to 65535.' >&2
    exit 1
fi
cd -- "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo 'Node.js and npm are required. Install Node.js, then run this script again.' >&2
    exit 1
fi
if [ ! -f node_modules/vite/bin/vite.js ]; then
    npm ci
fi
echo "Open http://127.0.0.1:$port/ in your browser. Press Ctrl+C to stop."
exec npm run dev -- --host 127.0.0.1 --port "$port" --strictPort
