# Task 0002 - Add canonical Action type (no behavior change)

## Goal
Create the canonical action contract used by the new engine: `{ action: string, payload?: any, meta?: any }`.

## Scope (only these files may be edited)
- (new) `src/nxt/runtime/actions/action.ts`
- `src/nxt/runtime/index.ts` (export)
- `src/nxt/index.ts` (export)

## Moves
None.

## Implementation steps
1. Create `src/nxt/runtime/actions/action.ts` exporting:
   - `export type ActionName = string;`
   - `export interface Action<P = any> { action: ActionName; payload?: P; meta?: any }`
2. Export it from `src/nxt/runtime/index.ts` and `src/nxt/index.ts`.

## Definition of Done
- `npm run build` passes
- No existing action types are modified yet
- No changes to runtime wiring

## Commands
- `npm ci`
- `npm run build`
