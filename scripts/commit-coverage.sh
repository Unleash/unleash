#!/bin/bash

git config --global user.name "${GH_NAME}"
git config --global user.email "${GH_EMAIL}"
echo "machine github.com login ${GH_NAME} password ${GH_TOKEN}" > ~/.netrc

git add coverage
git diff-index --quiet HEAD || git commit -m 'chore: update coverage reports'
git push origin