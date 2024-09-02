#!/bin/bash

echo "Deleting generated apis..."
rm -rf src/openapi/apis

# Remove all but last line from index.ts
echo "Cleaning index.ts..."
tail -1 src/openapi/index.ts > index_tmp ;
cat index_tmp > src/openapi/index.ts ;
rm index_tmp

echo "Formatting..."
yarn fmt

echo "Done!"
