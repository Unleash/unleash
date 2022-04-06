#!/usr/bin/env bash

set -feu

cd "$(dirname "$0")"

. ../env.sh

print_response_size () {
    local URL
    local RES
    URL="$1"
    RES="$(curl -s -H "Authorization: $PERF_AUTH_KEY" "$URL")"
    echo
    echo "$URL"
    echo
    echo "* Byte size: $(echo "$RES" | wc -c) bytes"
    echo "* GZIP size: $(echo "$RES" | gzip -6 | wc -c) bytes"
}

print_response_size "$PERF_APP_URL/api/admin/projects"

print_response_size "$PERF_APP_URL/api/admin/features"

print_response_size "$PERF_APP_URL/api/client/features"
