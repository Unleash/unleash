#!/usr/bin/env bash

set -feu

cd "$(dirname "$0")"

. ../env.sh

# Export data. Delete environments since they can't be imported.
curl -H "Authorization: $PERF_AUTH_KEY" "$PERF_APP_URL/api/admin/state/export" \
    | jq 'del(.environments)' \
    > export.json
