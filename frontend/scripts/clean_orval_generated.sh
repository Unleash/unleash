#!/bin/bash

echo "Deleting generated apis..."
rm -rf src/openapi/apis

# Remove all but last line from index.ts
echo "Cleaning index.ts..."
echo "export * from './models';" > src/openapi/index.ts
echo '' >> src/openapi/index.ts

echo "Formatting..."
yarn fmt

echo "Done!"
