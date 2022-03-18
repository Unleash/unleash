#!/usr/bin/env bash

set -feu

cd "$(dirname "$0")"

. ../env.sh

artillery run ./artillery.yaml --output artillery.json

artillery report artillery.json

echo "See artillery.json.html for results"
