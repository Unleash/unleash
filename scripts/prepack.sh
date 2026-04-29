#!/usr/bin/env sh
pnpm install && if [ ! -d ./dist ]; then pnpm build; fi
