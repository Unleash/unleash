#!/usr/bin/env sh
if [ ! -d ./frontend/build ]; then
    yarn --cwd ./frontend install --immutable && yarn build:frontend;
fi
