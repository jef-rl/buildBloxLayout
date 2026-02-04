# Task 0000 - TEMPLATE

## Goal
Describe the smallest end-to-end change this task accomplishes.

## Scope (only these files may be edited)
List every file that may be modified by this task.
- (example) `src/foo/bar.ts`
- (example) `src/baz/qux.ts`

## Moves (exact)
List every file move:
- FROM: `path/a.ts`
  TO:   `path/b.ts`

## Splits (exact)
If a source file is split into multiple single-purpose files:
- SOURCE: `path/source.ts`
  NEW FILES:
  - `path/new-one.ts` (purpose)
  - `path/new-two.ts` (purpose)
  SHIMS:
  - Keep `path/source.ts` as a shim re-exporting new modules.

## Implementation steps (explicit)
1. ...
2. ...
3. ...

## Definition of Done (must all pass)
- `npm run build` passes
- No new logic added to `index.ts` files
- Any moved file has a same-path shim
- No reducers call registries / DOM / IO (if reducers were touched)

## Commands
- `npm ci`
- `npm run build`
