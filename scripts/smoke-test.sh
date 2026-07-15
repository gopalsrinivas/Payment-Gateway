#!/usr/bin/env sh
set -eu

FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
API_URL="${API_URL:-$BACKEND_URL/api/v1}"

check_status() {
  url="$1"
  expected="$2"
  label="$3"
  status="$(curl -ksS -o /tmp/payment_gateway_smoke_body -w "%{http_code}" "$url")"
  if [ "$status" != "$expected" ]; then
    echo "Smoke check failed: $label expected $expected got $status"
    cat /tmp/payment_gateway_smoke_body || true
    exit 1
  fi
  echo "Smoke check passed: $label ($status)"
}

check_status "$FRONTEND_URL/" "200" "frontend home"
check_status "$API_URL/health" "200" "backend health"
check_status "$BACKEND_URL/api-docs/" "200" "swagger"
check_status "$API_URL/products" "200" "public products"
check_status "$API_URL/auth/profile" "401" "profile rejects missing token"

echo "Smoke tests completed"
