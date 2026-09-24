#!/usr/bin/env bash
# Enable Firestore and create a database in the student's region. Step 5.
#
# One script rather than two commands, because from the student's side this was
# a single request: "I need somewhere to keep records." The API that has to be
# enabled first is an implementation detail of that request, and the output
# says so as it goes.
set -uo pipefail

REGION="$(gcloud config get-value run/region 2>/dev/null)"
[ -z "$REGION" ] || [ "$REGION" = "(unset)" ] && REGION="us-central1"

# Say who and where before doing anything. A workbench on one machine and a
# gcloud signed in as someone else is an easy state to be in and a hard one to
# notice: the commands succeed, against the wrong project.
ACCOUNT="$(gcloud config get-value account 2>/dev/null)"
PROJECT="$(gcloud config get-value project 2>/dev/null)"
echo "· acting as ${ACCOUNT:-no account} on project ${PROJECT:-no project}"
echo

echo "· enabling the Firestore API"
if ! gcloud services enable firestore.googleapis.com --quiet; then
  echo "  could not enable the API. Check that billing is linked (step 3)."
  exit 1
fi
echo "  enabled"

echo
echo "· creating a database in ${REGION}"

# Firestore keeps the id "(default)" reserved for a few minutes after a
# database is deleted, and says how long in the error. Re-running the step
# straight after a cleanup lands here, so wait it out rather than calling it a
# failure: the request was right, the name is just not free yet.
create() {
  gcloud firestore databases create --location="${REGION}" --quiet 2>&1
}

for attempt in 1 2 3; do
  OUTPUT="$(create)"
  STATUS=$?

  if [ $STATUS -eq 0 ]; then
    echo "  created"
    break
  fi

  if gcloud firestore databases list --format='value(name)' 2>/dev/null | grep -q .; then
    echo "  a database already exists in this project, which is fine"
    break
  fi

  # "Please retry in 178 seconds." -- the API tells us how long to wait.
  SECONDS_LEFT="$(printf '%s' "$OUTPUT" | sed -n 's/.*retry in \([0-9][0-9]*\) second.*/\1/p' | head -1)"

  if [ -n "$SECONDS_LEFT" ] && [ "$attempt" -lt 3 ]; then
    WAIT=$((SECONDS_LEFT + 5))
    echo "  the name is still reserved from a database that was deleted here"
    echo "  waiting ${WAIT}s for it to be released, then trying again"
    sleep "$WAIT"
    continue
  fi

  echo "$OUTPUT" | tail -3
  echo "  could not create the database"
  exit 1
done

echo
echo "You chose a region. You did not choose a machine size, a disk, a password,"
echo "or a backup schedule. That is what a managed service means."
