#!/bin/bash

# Source Unleash instance
SOURCE_URL=""
SOURCE_API_TOKEN=""
SOURCE_ENV="production"
SOURCE_TAG="exported"

# Target Unleash instance
TARGET_URL=""
TARGET_API_TOKEN=""
TARGET_PROJECT="DemoImport"
TARGET_ENV="production"

export_data() {
  curl -s -w "\n%{http_code}" -X POST "$SOURCE_URL" \
    -H "Authorization: $SOURCE_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"tag\": \"$SOURCE_TAG\", \"environment\": \"$SOURCE_ENV\"}"
}

import_data() {
  data="$1"
  response=$(curl -s -w "\n%{http_code}" -X POST "$TARGET_URL" \
    -H "Authorization: $TARGET_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"project\": \"$TARGET_PROJECT\", \"environment\": \"$TARGET_ENV\", \"data\": $data}")

  http_code=$(echo "$response" | awk 'END{print}')

  if ! [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
      status_message=$(echo "$response" | awk 'NR==1{print}')
      echo "Error: Import failed with $http_code $status_message"
      exit 1
  fi
}

echo "Exporting data from source API: ${SOURCE_URL}, tag: ${SOURCE_TAG}, environment: ${SOURCE_ENV}"
response=$(export_data)
http_code=$(echo "$response" | awk 'END{print}')
if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
  data=$(echo "$response" | awk 'NR>1{print line} {line=$0}')
  echo "Data exported successfully."
else
  status_message=$(echo "$response" | awk 'NR==1{print}')
  echo "Error: Export failed with $http_code $status_message"
  exit 1
fi

echo "Importing data to target API: ${TARGET_URL}, project: ${TARGET_PROJECT}, environment: ${TARGET_ENV}"
import_data "$data"
echo "Data imported successfully."
