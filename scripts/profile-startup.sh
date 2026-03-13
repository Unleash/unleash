#!/usr/bin/env bash

set -euo pipefail

yarn prepare:backend

PROFILE_DIR="${STARTUP_PROFILE_DIR:-.profiles/startup}"
TARGET="${STARTUP_PROFILER_TARGET:-dist/server.js}"
HOST="${STARTUP_PROFILE_HOST:-127.0.0.1}"
PORT="${STARTUP_PROFILE_PORT:-${HTTP_PORT:-${PORT:-4242}}}"
READY_TIMEOUT_SECONDS="${STARTUP_PROFILE_TIMEOUT_SECONDS:-120}"
SHUTDOWN_DELAY_SECONDS="${STARTUP_PROFILE_SHUTDOWN_DELAY_SECONDS:-1}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
CPU_PROFILE_NAME="startup-${TIMESTAMP}.cpuprofile"
TRACE_PATTERN="${PROFILE_DIR}/trace-${TIMESTAMP}-\${pid}.json"
LOG_FILE="${PROFILE_DIR}/startup-${TIMESTAMP}.log"

mkdir -p "${PROFILE_DIR}"

export TZ=UTC
export NODE_ENV="${NODE_ENV:-production}"

node \
    --enable-source-maps \
    --cpu-prof \
    --cpu-prof-dir="${PROFILE_DIR}" \
    --cpu-prof-name="${CPU_PROFILE_NAME}" \
    --trace-events-enabled \
    --trace-event-categories="node,node.async_hooks,v8" \
    --trace-event-file-pattern="${TRACE_PATTERN}" \
    "${TARGET}" >"${LOG_FILE}" 2>&1 &
APP_PID=$!

cleanup() {
    if kill -0 "${APP_PID}" >/dev/null 2>&1; then
        kill -TERM "${APP_PID}" >/dev/null 2>&1 || true
        wait "${APP_PID}" >/dev/null 2>&1 || true
    fi
}

trap cleanup EXIT INT TERM

deadline=$((SECONDS + READY_TIMEOUT_SECONDS))
while true; do
    if node -e "const net = require('node:net'); const [host, port] = process.argv.slice(1); const socket = net.connect({ host, port: Number(port) }); socket.once('connect', () => { socket.end(); process.exit(0); }); socket.once('error', () => process.exit(1)); setTimeout(() => process.exit(1), 500);" "${HOST}" "${PORT}"; then
        break
    fi

    if ! kill -0 "${APP_PID}" >/dev/null 2>&1; then
        echo "Startup profiling target exited before becoming ready. See ${LOG_FILE}" >&2
        wait "${APP_PID}"
    fi

    if (( SECONDS >= deadline )); then
        echo "Timed out waiting for ${HOST}:${PORT}. See ${LOG_FILE}" >&2
        exit 1
    fi

    sleep 1
done

sleep "${SHUTDOWN_DELAY_SECONDS}"
kill -INT "${APP_PID}" >/dev/null 2>&1 || true
wait "${APP_PID}" || true
trap - EXIT INT TERM

echo "Startup profile written to ${PROFILE_DIR}"
echo "CPU profile: ${PROFILE_DIR}/${CPU_PROFILE_NAME}"
echo "Trace events: ${TRACE_PATTERN}"
echo "App log: ${LOG_FILE}"
