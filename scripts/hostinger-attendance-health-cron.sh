#!/bin/sh

set -u

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

HEARTBEAT_ENDPOINT="$BASE_URL/api/automation/attendance/scheduler-heartbeat"

RESPONSE_FILE="$(mktemp)"

cleanup() {
  rm -f "$RESPONSE_FILE"
}

trap cleanup EXIT HUP INT TERM

send_heartbeat() {
  heartbeat_outcome="$1"
  heartbeat_http_status="$2"
  heartbeat_started_at="$3"
  heartbeat_finished_at="$4"
  heartbeat_message="$5"

  curl \
    --silent \
    --show-error \
    --location \
    --output /dev/null \
    --request POST \
    --header "X-Attendance-Automation-Secret: $ATTENDANCE_AUTOMATION_SECRET" \
    --data-urlencode "task=HEALTH" \
    --data-urlencode "outcome=$heartbeat_outcome" \
    --data-urlencode "httpStatus=$heartbeat_http_status" \
    --data-urlencode "startedAt=$heartbeat_started_at" \
    --data-urlencode "finishedAt=$heartbeat_finished_at" \
    --data-urlencode "message=$heartbeat_message" \
    "$HEARTBEAT_ENDPOINT"

  return $?
}

STARTED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

printf '%s\n' "Starland attendance automation health cron"
printf '%s\n' "Endpoint: $ENDPOINT"
printf '%s\n' "Started UTC: $STARTED_AT"

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

CURL_EXIT_CODE="$?"

FINISHED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

if [ -s "$RESPONSE_FILE" ]; then
  cat "$RESPONSE_FILE"
  printf '\n'
fi

printf '%s\n' "HTTP status: $HTTP_STATUS"
printf '%s\n' "Finished UTC: $FINISHED_AT"

OUTCOME="FAILED"
MESSAGE="Attendance automation health request failed."
SCRIPT_EXIT_CODE=1

if [ "$CURL_EXIT_CODE" -ne 0 ]; then
  HTTP_STATUS=""
  MESSAGE="curl failed with exit code $CURL_EXIT_CODE."
elif [ "$HTTP_STATUS" = "200" ]; then
  OUTCOME="SUCCESS"
  MESSAGE="Attendance automation health check passed."
  SCRIPT_EXIT_CODE=0
elif [ "$HTTP_STATUS" = "503" ]; then
  OUTCOME="ATTENTION"
  MESSAGE="Attendance automation health requires attention."
  SCRIPT_EXIT_CODE=2
elif [ "$HTTP_STATUS" = "401" ]; then
  MESSAGE="Attendance automation health authentication failed."
else
  MESSAGE="Attendance automation health returned HTTP $HTTP_STATUS."
fi

if ! send_heartbeat \
  "$OUTCOME" \
  "$HTTP_STATUS" \
  "$STARTED_AT" \
  "$FINISHED_AT" \
  "$MESSAGE"; then
  printf '%s\n' "Warning: scheduler heartbeat could not be recorded." >&2
fi

printf '%s\n' "$MESSAGE"

exit "$SCRIPT_EXIT_CODE"