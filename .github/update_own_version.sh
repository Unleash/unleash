#!/bin/bash

set -e

CURRENT_VERSION=$(node -p "require('./package.json').version")
echo $CURRENT_VERSION

if [[ $CURRENT_VERSION == *beta* ]]; then
  echo "Current beta update"
  npm version prerelease --preid=beta --ignore-scripts
else
  echo "Next minor beta update"
  npm version preminor --preid=beta --ignore-scripts
fi
