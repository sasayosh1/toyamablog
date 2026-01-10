#!/usr/bin/env bash
set -euo pipefail

if [ -z "${SANITY_PROJECT_ID:-}" ] || [ -z "${SANITY_DATASET:-}" ] || [ -z "${SANITY_TOKEN:-}" ]; then
  echo "Please set SANITY_PROJECT_ID, SANITY_DATASET and SANITY_TOKEN in your environment."
  exit 1
fi
BASE_URL="https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07"
