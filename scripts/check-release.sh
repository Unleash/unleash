#!/bin/bash
set -e

echo -e "\n STEP 1. Check unleash-frontend version"
node scripts/check-release.js $1

echo -e "\n STEP 2. Lint"
yarn run lint

echo -e "\n STEP 3. Build"
yarn run build

echo -e "\n STEP 4. Test"
yarn run test