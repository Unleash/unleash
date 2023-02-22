#!/bin/bash

set -e

yarn
yarn run lint
yarn run test

cd frontend
yarn run ts:check
yarn run lint:check
yarn run fmt:check
yarn run test
