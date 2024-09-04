#!/usr/bin/env sh
yarn --cwd ./frontend install && if [ ! -d ./dist ]; then yarn build; fi
