#!/bin/bash

# A simpler, more robust script to rewrite Git history timestamps.

# --- PRE-FLIGHT CHECK ---
if ! command -v git-filter-repo &> /dev/null
then
    echo "❌ Error: git-filter-repo is not installed. Please run: pip install git-filter-repo"
    exit 1
fi

# --- MAIN LOGIC ---
echo "🚀 Preparing to rewrite history with hardcoded timestamps..."

# The Python callback function for git-filter-repo
# Timestamps are placed directly inside the Python code for reliability.
CALLBACK_CODE=$(cat <<'END_PYTHON'
import datetime
import time

# List of new timestamps from OLDEST to NEWEST
timestamps = [
    "2025-09-26T19:39:00",
    "2025-09-26T19:59:00",
    "2025-09-26T21:29:00",
    "2025-09-26T21:44:00",
    "2025-09-26T23:44:00",
    "2025-09-27T00:59:00",
    "2025-09-27T01:29:00",
    "2025-09-27T02:29:00",
    "2025-09-27T04:24:00",
]

# Create an iterator to supply one date for each commit processed
date_iter = iter(timestamps)
local_tz = time.strftime('%z')

def change_commit_date(commit, metadata):
    try:
        new_date_str = next(date_iter)
        dt_obj = datetime.datetime.fromisoformat(new_date_str)
        unix_timestamp = int(dt_obj.timestamp())
        new_date_bytes = f"{unix_timestamp} {local_tz}".encode('utf-8')
        commit.author_date = new_date_bytes
        commit.committer_date = new_date_bytes
    except StopIteration:
        # This happens if there are more commits than timestamps. We do nothing.
        pass

END_PYTHON
)

# Run the history rewrite operation
git filter-repo --commit-callback "${CALLBACK_CODE}" --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ History rewrite complete!"
    echo "   Please verify with 'git log'."
    echo "   When ready, force-push with: git push --force-with-lease origin main"
else
    echo "❌ Error: git-filter-repo failed."
fi