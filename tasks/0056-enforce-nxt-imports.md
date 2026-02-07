# Task 0056 - Enforce NXT imports

## Goal
Prevent imports from `packages/framework/src` (or direct `framework/src` paths), document the NXT entrypoint, and provide a runnable check for CI.

## Scope (only these files may be edited)
- `eslint.config.js`
- `package.json`
- `scripts/check-framework-src-imports.mjs`
- `DOCS/FRAMEWORK_DEVELOPMENT_GUIDE.md`
- `tasks/0056-enforce-nxt-imports.md`

## Moves (exact)
- None.

## Splits (exact)
- None.

## Implementation steps (explicit)
1. Add an ESLint restriction to block `framework/src` imports.
2. Add a Node-based import check script and npm script entry.
3. Update the framework development guide to direct contributors to `packages/framework/nxt`.

## Definition of Done (must all pass)
- The import check script exits non-zero if a forbidden import is detected.
- Documentation highlights the NXT entrypoint and avoids `framework/src` guidance.
- `npm run build` still passes.

## Commands
- `npm ci`
- `npm run build`
