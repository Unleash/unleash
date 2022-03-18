#!/usr/bin/env bash

set -feu

cd "$(dirname "$0")"

. ../env.sh

curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $PERF_AUTH_KEY" \
    -d @export.json \
    "$PERF_APP_URL/api/admin/state/import?drop=true&keep=false"
