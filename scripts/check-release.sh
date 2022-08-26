#!/bin/bash

set -e

yarn
yarn run lint
yarn run test

cd frontend
yarn run lint
yarn run test
