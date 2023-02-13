#!/usr/bin/env bash
set -e
FOLDER="${1:-.}"

cd "${FOLDER}"

# update strictNullChecks
sed -i 's/\/\/\s*"strictNullChecks":\s*true,/"strictNullChecks": true,/' "./tsconfig.json"

# count errors
ERRORS=$(yarn 2> /dev/null | grep "Found [0-9]* errors" | sed 's/Found \(.*\) errors in .* files./\1/')

echo ${ERRORS:-0}