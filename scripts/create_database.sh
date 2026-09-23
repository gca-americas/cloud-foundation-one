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

echo "· enabling the Firestore API"
if ! gcloud services enable firestore.googleapis.com --quiet; then
  echo "  could not enable the API. Check that billing is linked (step 3)."
  exit 1
fi
echo "  enabled"

echo
echo "· creating a database in ${REGION}"
if gcloud firestore databases create --location="${REGION}" --quiet 2>&1; then
  echo "  created"
else
  # Re-running the step is normal, and an existing database is a success.
  if gcloud firestore databases list --format='value(name)' 2>/dev/null | grep -q .; then
    echo "  a database already exists in this project, which is fine"
  else
    echo "  could not create the database"
    exit 1
  fi
fi

echo
echo "You chose a region. You did not choose a machine size, a disk, a password,"
echo "or a backup schedule. That is what a managed service means."
