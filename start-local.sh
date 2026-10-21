#!/bin/sh
set -eu
cd -- "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
    echo 'Node.js and npm are required. Install Node.js, then run this script again.' >&2
    exit 1
fi
# Preserve the original numeric first argument as a port.
case "${1:-start}" in
    start|status|stop) action=${1:-start}; port=${2:-5187}; [ "$#" -le 2 ] || exit 1 ;;
    *) action=start; port=$1; [ "$#" -le 1 ] || exit 1 ;;
esac
exec node tools/local-server.mjs "$action" "$port"
