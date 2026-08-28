#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <unleash-openapi.json> <edge-openapi.json> [exceptions-file]" >&2
  exit 2
fi

UNLEASH_SPEC="$1"
EDGE_SPEC="$2"
EXCEPTIONS_FILE="${3:-}"

for spec in "$UNLEASH_SPEC" "$EDGE_SPEC"; do
  if [[ ! -f "$spec" ]]; then
    echo "OpenAPI spec not found: $spec" >&2
    exit 2
  fi
done

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to compare OpenAPI routes" >&2
  exit 2
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

extract_routes() {
  local spec="$1"

  jq -r '
    .paths
    | to_entries[]
    | select(.key | startswith("/api/client"))
    | (.key | gsub("\\{[^}]+\\}"; "{}")) as $path
    | .value
    | keys[]
    | select(test("^(get|post|put|patch|delete|head|options)$"))
    | "\(. | ascii_upcase) \($path)"
  ' "$spec" | sort -u
}

extract_exceptions() {
  local file="$1"

  if [[ -n "$file" && -f "$file" ]]; then
    sed -E '
      s/#.*$//
      s/[[:space:]]+$//
      s/^[[:space:]]+//
      /^$/d
      s/\{[^}]+\}/{}/g
    ' "$file" | sort -u
  fi
}

unleash_routes="$tmp_dir/unleash-routes.txt"
edge_routes="$tmp_dir/edge-routes.txt"
exceptions="$tmp_dir/edge-route-exceptions.txt"
missing_before_exceptions="$tmp_dir/missing-before-exceptions.txt"
missing_after_exceptions="$tmp_dir/missing-after-exceptions.txt"

extract_routes "$UNLEASH_SPEC" > "$unleash_routes"
extract_routes "$EDGE_SPEC" > "$edge_routes"
extract_exceptions "$EXCEPTIONS_FILE" > "$exceptions"

comm -23 "$unleash_routes" "$edge_routes" > "$missing_before_exceptions"
comm -23 "$missing_before_exceptions" "$exceptions" > "$missing_after_exceptions"

unleash_count="$(wc -l < "$unleash_routes" | tr -d ' ')"
edge_count="$(wc -l < "$edge_routes" | tr -d ' ')"
exception_count="$(wc -l < "$exceptions" | tr -d ' ')"
missing_count="$(wc -l < "$missing_after_exceptions" | tr -d ' ')"

echo "Unleash /api/client routes: $unleash_count"
echo "Edge /api/client routes: $edge_count"
echo "Allowed exceptions: $exception_count"

if [[ "$missing_count" -gt 0 ]]; then
  echo "Edge is missing $missing_count required /api/client route(s):"
  while IFS= read -r route; do
    echo "::error title=Missing Edge route::$route"
    echo "$route"
  done < "$missing_after_exceptions"
  exit 1
fi

echo "Edge contains all required Unleash /api/client routes"
