#!/bin/bash

set -e

echo "CI: $CI"
echo "TEST_DATABASE_URL: $TEST_DATABASE_URL"
echo "DATABASE_URL: $DATABASE_URL"


yarn
yarn run lint
yarn run build:backend
yarn run test:report

cd frontend
yarn run ts:check
yarn run lint:check
yarn run fmt:check
yarn run test
