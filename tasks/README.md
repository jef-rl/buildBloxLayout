# Tasks

Each task file in this folder is intended to be executed by Codex (CLI or GitHub Action) and result in a single PR.

## Conventions

- One task file = one PR
- Tasks are sequential and small
- Each task:
  - lists exact files that may be changed
  - lists exact file moves/splits
  - includes shim requirements
  - includes Definition of Done (DoD) and commands

## Running via GitHub Actions

Use the workflow:
- `.github/workflows/codex-task-pr.yml`

Workflow input:
- `task`: filename under `tasks/` (e.g. `0001-create-nxt-skeleton.md`)

## Running locally

Use:
- `scripts/codex-task-pr.sh tasks/0001-create-nxt-skeleton.md`
