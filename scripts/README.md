# Scripts

## codex-task-pr.sh

Creates a new branch, runs a task prompt with Codex CLI, builds, commits, and opens a PR via GitHub CLI.

### Requirements
- Codex CLI installed and available as `codex`
- `OPENAI_API_KEY` exported in your shell
- GitHub CLI `gh` installed and authenticated

### Usage
```bash
chmod +x scripts/codex-task-pr.sh
scripts/codex-task-pr.sh tasks/0001-create-nxt-skeleton.md
```

If this is a monorepo, change the install/build commands inside the script to target the correct package.
