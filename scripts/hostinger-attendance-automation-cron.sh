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

HEARTBEAT_ENDPOINT="$BASE_URL/api/automation/attendance/scheduler-heartbeat"

EXECUTION_ID="automation-$(date -u '+%Y%m%dT%H%M%SZ')-$$"

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

  heartbeat_response="$(
    curl \
      --silent \
      --show-error \
      --location \
      --connect-timeout 15 \
      --max-time 60 \
      --output /dev/null \
      --write-out "%{http_code}" \
      --request POST \
      --header "X-Attendance-Automation-Secret: $ATTENDANCE_AUTOMATION_SECRET" \
      --data-urlencode "executionId=$EXECUTION_ID" \
      --data-urlencode "task=AUTOMATION" \
      --data-urlencode "outcome=$heartbeat_outcome" \
      --data-urlencode "httpStatus=$heartbeat_http_status" \
      --data-urlencode "startedAt=$heartbeat_started_at" \
      --data-urlencode "finishedAt=$heartbeat_finished_at" \
      --data-urlencode "message=$heartbeat_message" \
      "$HEARTBEAT_ENDPOINT"
  )"

  heartbeat_curl_exit="$?"

  if [ "$heartbeat_curl_exit" -ne 0 ]; then
    return 1
  fi

  case "$heartbeat_response" in
    200|201)
      return 0
      ;;

    *)
      printf '%s\n' "Heartbeat endpoint returned HTTP $heartbeat_response." >&2
      return 1
      ;;
  esac
}

STARTED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

printf '%s\n' "Starland attendance automation cron"
printf '%s\n' "Execution ID: $EXECUTION_ID"
printf '%s\n' "Endpoint: $ENDPOINT"
printf '%s\n' "Started UTC: $STARTED_AT"

HTTP_STATUS="$(
  curl \
    --silent \
    --show-error \
    --location \
    --connect-timeout 15 \
    --max-time 300 \
    --output "$RESPONSE_FILE" \
    --write-out "%{http_code}" \
    --request POST \
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
MESSAGE="Attendance automation request failed."
SCRIPT_EXIT_CODE=1

if [ "$CURL_EXIT_CODE" -ne 0 ]; then
  HTTP_STATUS=""
  MESSAGE="curl failed with exit code $CURL_EXIT_CODE."
elif [ "$HTTP_STATUS" = "200" ] ||
     [ "$HTTP_STATUS" = "201" ]; then
  OUTCOME="SUCCESS"
  MESSAGE="Attendance automation completed successfully."
  SCRIPT_EXIT_CODE=0
elif [ "$HTTP_STATUS" = "409" ]; then
  OUTCOME="SKIPPED"
  MESSAGE="Automation was already running; no duplicate execution was started."
  SCRIPT_EXIT_CODE=0
elif [ "$HTTP_STATUS" = "401" ]; then
  MESSAGE="Attendance automation authentication failed."
else
  MESSAGE="Attendance automation returned HTTP $HTTP_STATUS."
fi

if ! send_heartbeat \
  "$OUTCOME" \
  "$HTTP_STATUS" \
  "$STARTED_AT" \
  "$FINISHED_AT" \
  "$MESSAGE"; then
  printf '%s\n' "Warning: the V2 scheduler heartbeat could not be recorded." >&2
fi

printf '%s\n' "$MESSAGE"

exit "$SCRIPT_EXIT_CODE"