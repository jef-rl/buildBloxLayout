# Task 0001 — Create Nxt Skeleton

## Migration Rules (Must Be Obeyed)

**R0 — Shim rule**
When moving or splitting a file, leave a same-path shim that only re-exports from the new location.
No logic in shims.

**R1 — Single purpose**
Each new file must have exactly one responsibility.
`index.ts` files are re-export only.

**R2 — Build gate**
This task is complete only if `npm run build` passes.

## Goal
Create the `src/nxt` folder skeleton without changing behavior.

## Scope
- src/index.ts
- src/nxt/** (new files only)

## Steps
1. Create `src/nxt/index.ts`
2. Create empty index files under:
   - src/nxt/runtime
   - src/nxt/compat
   - src/nxt/reducers
   - src/nxt/effects
   - src/nxt/views
   - src/nxt/definitions
3. Export `src/nxt/index.ts` from `src/index.ts`

## DoD
- Build passes
- No runtime behavior change
