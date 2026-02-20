#!/bin/bash

echo "Running codemod on: '$1'"
npx jscodeshift --extensions=tsx,jsx -t="scripts/jscodeshift-transform-conditionallyrender.js" $1
npx jscodeshift --extensions=tsx,jsx -t="scripts/jscodeshift-transform-conditionallyrender.js" $1

./node_modules/.bin/biome lint src --write --unsafe
./node_modules/.bin/biome format src --write
