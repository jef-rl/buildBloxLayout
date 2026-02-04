#!/usr/bin/env bash
set -euo pipefail

TASK_FILE="${1:?Usage: scripts/codex-task-pr.sh tasks/0001-create-nxt-skeleton.md}"
BRANCH="codex/$(basename "$TASK_FILE" .md)"

git checkout -b "$BRANCH"

# Run Codex (requires codex CLI installed and OPENAI_API_KEY set)
codex exec --prompt-file "$TASK_FILE"

# Adjust these for your repo if needed
npm ci
npm run build

git add -A
git commit -m "Task: $(basename "$TASK_FILE")"

# Open PR (requires GitHub CLI 'gh' authenticated)
gh pr create --title "Task: $(basename "$TASK_FILE")" --body "Source task: $TASK_FILE" --fill
