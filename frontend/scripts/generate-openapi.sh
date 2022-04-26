#!/bin/sh

# Generate OpenAPI bindings for the Unleash API.
# https://openapi-generator.tech/docs/generators/typescript-fetch

set -feux
cd "$(dirname "$0")"

# URL to the generated open API spec.
# Set the UNLEASH_OPENAPI_URL environment variable to override.
UNLEASH_OPENAPI_URL="${UNLEASH_OPENAPI_URL:-http://localhost:4242/docs/openapi.json}"

rm -rf "../src/openapi"
mkdir "../src/openapi"

npx @openapitools/openapi-generator-cli generate \
    -g "typescript-fetch" \
    -i "$UNLEASH_OPENAPI_URL" \
    -o "../src/openapi"

# Remove unused files.
rm  "openapitools.json"
rm  "../src/openapi/.openapi-generator-ignore"
rm  -r "../src/openapi/.openapi-generator"
