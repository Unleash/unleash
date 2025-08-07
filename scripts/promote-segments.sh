#!/bin/bash

# Source Unleash instance, example: https://localhost:4242/api/admin/segments
SOURCE_URL=""
SOURCE_API_TOKEN=""

# Target Unleash instance, example: https://localhost:4242/api/admin/segments
TARGET_URL=""
TARGET_API_TOKEN=""

# Configuration
SEGMENT_NAME=""  # Optional: specify a specific segment name to promote

export_segments() {
  curl -s -w "\n%{http_code}" -X GET "$SOURCE_URL" \
    -H "Authorization: $SOURCE_API_TOKEN" \
    -H "Content-Type: application/json"
}

create_segment() {
  local segment_data="$1"
  response=$(curl -s -w "\n%{http_code}" -X POST "$TARGET_URL" \
    -H "Authorization: $TARGET_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$segment_data")

  http_code=$(echo "$response" | awk 'END{print}')

  if ! [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
    status_message=$(echo "$response" | awk 'NR==1{print}')
    echo "Warning: Failed to create segment with $http_code $status_message"
    echo "Response: $status_message"
    return 1
  fi
  return 0
}

update_segment() {
  local segment_id="$1"
  local segment_data="$2"
  response=$(curl -s -w "\n%{http_code}" -X PUT "$TARGET_URL/$segment_id" \
    -H "Authorization: $TARGET_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$segment_data")

  http_code=$(echo "$response" | awk 'END{print}')

  if ! [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
    status_message=$(echo "$response" | awk 'NR==1{print}')
    echo "Warning: Failed to update segment $segment_id with $http_code $status_message"
    echo "Response: $status_message"
    return 1
  fi
  return 0
}

check_segment_exists() {
  local segment_id="$1"
  response=$(curl -s -w "\n%{http_code}" -X GET "$TARGET_URL/$segment_id" \
    -H "Authorization: $TARGET_API_TOKEN" \
    -H "Content-Type: application/json")

  http_code=$(echo "$response" | awk 'END{print}')

  if [[ $http_code -eq 200 ]]; then
    return 0  # Segment exists
  else
    return 1  # Segment does not exist
  fi
}

process_segment() {
  local segment="$1"
  local segment_id=$(echo "$segment" | jq -r '.id')
  local segment_name=$(echo "$segment" | jq -r '.name')

  # Skip if specific segment name is specified and doesn't match
  if [[ -n "$SEGMENT_NAME" && "$segment_name" != "$SEGMENT_NAME" ]]; then
    return 0
  fi

  echo "Processing segment: $segment_name (ID: $segment_id)"

  # Remove readonly fields that shouldn't be included in create/update requests
  segment_data=$(echo "$segment" | jq 'del(.id, .createdAt, .createdBy)')

  if check_segment_exists "$segment_id"; then
    echo "  Segment exists, updating..."
    if update_segment "$segment_id" "$segment_data"; then
      echo "  ✓ Updated segment: $segment_name"
    else
      echo "  ✗ Failed to update segment: $segment_name"
    fi
  else
    echo "  Segment doesn't exist, creating..."
    if create_segment "$segment_data"; then
      echo "  ✓ Created segment: $segment_name"
    else
      echo "  ✗ Failed to create segment: $segment_name"
    fi
  fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --segment-name)
      SEGMENT_NAME="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [--segment-name SEGMENT_NAME]"
      echo ""
      echo "Options:"
      echo "  --segment-name  Promote only the specified segment by name"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "Exporting segments from source API: ${SOURCE_URL}"
if [[ -n "$SEGMENT_NAME" ]]; then
  echo "Filtering for segment: $SEGMENT_NAME"
fi

response=$(export_segments)
http_code=$(echo "$response" | awk 'END{print}')

# Exit if export fails
if [[ ! ($http_code -ge 200 && $http_code -lt 300) ]]; then
  status_message=$(echo "$response" | awk 'NR==1{print}')
  echo "Error: Export failed with $http_code $status_message"
  exit 1
fi

data=$(echo "$response" | awk 'NR>1{print line} {line=$0}')
echo "Segments exported successfully."

# Check if we have valid JSON data
if ! echo "$data" | jq empty 2>/dev/null; then
  echo "Error: Invalid JSON response from source API"
  exit 1
fi

# Count total segments
segment_count=$(echo "$data" | jq '.segments | length')
echo "Found $segment_count segments to process."

if [[ $segment_count -eq 0 ]]; then
  echo "No segments found to promote."
  exit 0
fi

# Process each segment
echo ""
echo "Processing segments on target API: ${TARGET_URL}"

success_count=0
failure_count=0

while read -r segment; do
  if process_segment "$segment"; then
    ((success_count++))
  else
    ((failure_count++))
  fi
done < <(echo "$data" | jq -c '.segments[]')

echo ""
echo "Segment promotion completed."
echo "Summary: $success_count successful, $failure_count failed"

if [[ $failure_count -gt 0 ]]; then
  echo "⚠️  Some segments failed to promote. Check the output above for details."
  exit 1
else
  echo "✅ All segments promoted successfully!"
fi
