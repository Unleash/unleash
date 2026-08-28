#!/usr/bin/env sh
if [ ! -d ./frontend/build ]; then
    pnpm install --frozen-lockfile && pnpm build:frontend;
fi
