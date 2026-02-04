# Codex Task -> PR workflow

## Install

Copy these files into your repo root:

- `.github/workflows/codex-task-pr.yml`
- `tasks/*`
- `AGENTS.md`
- `scripts/*` (optional for local use)

Then add a GitHub Actions secret:

- `OPENAI_API_KEY` (repo settings → Secrets and variables → Actions)

## Run

GitHub → Actions → **Codex task -> PR** → **Run workflow**

Inputs:

- `task`: e.g. `0001-create-nxt-skeleton.md`
- `working_directory`: `.` (or a package folder if this is a monorepo)
- `install_cmd`: `npm ci` (change to `pnpm -w install` if needed)
- `build_cmd`: `npm run build` (change to `npm -w packages/framework run build` if needed)

The workflow will:
1. Checkout
2. Run Codex with the task prompt file
3. Install dependencies
4. Run build
5. Open a PR
