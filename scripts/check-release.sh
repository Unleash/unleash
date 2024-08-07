#!/bin/bash

set -e

yarn
yarn run lint
yarn run build:backend
yarn run test:report

cd frontend
yarn
yarn run ts:check
yarn run lint:check
yarn run fmt:check
yarn run test
