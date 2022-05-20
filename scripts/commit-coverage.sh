#!/bin/bash

git add coverage
git diff-index --quiet HEAD || git commit -m 'chore: update coverage reports'
git push origin