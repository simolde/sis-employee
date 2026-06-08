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

ATTENDANCE_AUTOMATION_LIMIT="${ATTENDANCE_AUTOMATION_LIMIT:-100}"

case "$ATTENDANCE_AUTOMATION_LIMIT" in
  ""|*[!0-9]*)
    printf '%s\n' "ATTENDANCE_AUTOMATION_LIMIT must be an integer." >&2
    exit 1
    ;;
esac

if [ "$ATTENDANCE_AUTOMATION_LIMIT" -lt 1 ] ||
   [ "$ATTENDANCE_AUTOMATION_LIMIT" -gt 500 ]; then
  printf '%s\n' "ATTENDANCE_AUTOMATION_LIMIT must be between 1 and 500." >&2
  exit 1
fi

BASE_URL="${ATTENDANCE_AUTOMATION_BASE_URL%/}"

ENDPOINT="$BASE_URL/api/automation/attendance/approved-leave-excused?limit=$ATTENDANCE_AUTOMATION_LIMIT"

RESPONSE_FILE="$(mktemp)"

cleanup() {
  rm -f "$RESPONSE_FILE"
}

trap cleanup EXIT HUP INT TERM

printf '%s\n' "Starland attendance automation cron"
printf '%s\n' "Endpoint: $ENDPOINT"
printf '%s\n' "Started UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

HTTP_STATUS="$(
  curl \
    --silent \
    --show-error \
    --location \
    --output "$RESPONSE_FILE" \
    --write-out "%{http_code}" \
    --request POST \
    --header "Accept: application/json" \
    --header "X-Attendance-Automation-Secret: $ATTENDANCE_AUTOMATION_SECRET" \
    "$ENDPOINT"
)"

cat "$RESPONSE_FILE"
printf '\n'
printf '%s\n' "HTTP status: $HTTP_STATUS"
printf '%s\n' "Finished UTC: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

case "$HTTP_STATUS" in
  200|201)
    printf '%s\n' "Attendance automation completed successfully."
    exit 0
    ;;

  409)
    printf '%s\n' "Attendance automation was already running. No duplicate execution was started."
    exit 0
    ;;

  401)
    printf '%s\n' "Attendance automation authentication failed." >&2
    exit 1
    ;;

  *)
    printf '%s\n' "Attendance automation returned an unexpected HTTP status." >&2
    exit 1
    ;;
esac