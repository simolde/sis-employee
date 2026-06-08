#!/bin/sh

set -eu

DEFAULT_ENV_FILE="$HOME/private/starland-attendance/.attendance-automation-cron.env"

ENV_FILE="${1:-${ATTENDANCE_AUTOMATION_CRON_ENV_FILE:-$DEFAULT_ENV_FILE}}"

if [ ! -f "$ENV_FILE" ]; then
  printf '%s\n' "Cron environment file was not found: $ENV_FILE" >&2
  exit 1
fi

set -a

# shellcheck disable=SC1090
. "$ENV_FILE"

set +a

: "${ATTENDANCE_AUTOMATION_BASE_URL:?ATTENDANCE_AUTOMATION_BASE_URL is required}"
: "${ATTENDANCE_AUTOMATION_SECRET:?ATTENDANCE_AUTOMATION_SECRET is required}"

ATTENDANCE_AUTOMATION_HEALTH_MODE="${ATTENDANCE_AUTOMATION_HEALTH_MODE:-strict}"

case "$ATTENDANCE_AUTOMATION_HEALTH_MODE" in
  strict|operational)
    ;;

  *)
    printf '%s\n' "ATTENDANCE_AUTOMATION_HEALTH_MODE must be strict or operational." >&2
    exit 1
    ;;
esac

BASE_URL="${ATTENDANCE_AUTOMATION_BASE_URL%/}"

ENDPOINT="$BASE_URL/api/automation/attendance/health?mode=$ATTENDANCE_AUTOMATION_HEALTH_MODE"

RESPONSE_FILE="$(mktemp)"

cleanup() {
  rm -f "$RESPONSE_FILE"
}

trap cleanup EXIT HUP INT TERM

printf '%s\n' "Starland attendance automation health cron"
printf '%s\n' "Endpoint: $ENDPOINT"
printf '%s\n' "Started UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

HTTP_STATUS="$(
  curl \
    --silent \
    --show-error \
    --location \
    --output "$RESPONSE_FILE" \
    --write-out "%{http_code}" \
    --request GET \
    --header "Accept: application/json" \
    --header "X-Attendance-Automation-Secret: $ATTENDANCE_AUTOMATION_SECRET" \
    "$ENDPOINT"
)"

cat "$RESPONSE_FILE"
printf '\n'
printf '%s\n' "HTTP status: $HTTP_STATUS"
printf '%s\n' "Finished UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

case "$HTTP_STATUS" in
  200)
    printf '%s\n' "Attendance automation health check passed."
    exit 0
    ;;

  503)
    printf '%s\n' "Attendance automation health requires attention." >&2
    exit 2
    ;;

  401)
    printf '%s\n' "Attendance automation health authentication failed." >&2
    exit 1
    ;;

  *)
    printf '%s\n' "Attendance automation health returned an unexpected HTTP status." >&2
    exit 1
    ;;
esac