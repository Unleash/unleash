#!/usr/bin/env bash

set -euo pipefail

yarn prepare:backend

export TZ=UTC
export NODE_ENV="${NODE_ENV:-development}"
export NODE_OPTIONS="--enable-source-maps --import file://${PWD}/dist/startup-profiler.js ${NODE_OPTIONS-}"

node dist/server-dev.js
