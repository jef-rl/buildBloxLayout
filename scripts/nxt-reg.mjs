
// scripts/setup-nxt-registries.mjs
// Creates the NXT structure and core registry/context files for packages/framework

import { promises as fs } from 'fs';
import path from 'path';

const cwd = process.cwd();
const frameworkRoot = path.join(cwd, 'packages', 'framework');
const srcRoot = path.join(frameworkRoot, 'src');
const nxtRoot = path.join(srcRoot, 'nxt');

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeFile(relPath, content) {
  const full = path.join(frameworkRoot, relPath);
  await ensureDir(path.dirname(full));
  await fs.writeFile(full, content.replace(/^\n/, ''), 'utf8');
  console.log('Wrote', relPath);
}

async function upsertFrameworkIndex() {
  const indexPath = path.join(srcRoot, 'index.ts');
  let existing = '';
  try {
    existing = await fs.readFile(indexPath, 'utf8');
  } catch {
    // create minimal index if missing
    await fs.writeFile(indexPath, "export * from './nxt';\n", 'utf8');
    console.log('Created src/index.ts with NXT export');
    return;
  }

  if (!existing.includes("export * from './nxt'")) {
    const updated = existing.replace(/\s*$/, '\n') + "export * from './nxt';\n";
    await fs.writeFile(indexPath, updated, 'utf8');
    console.log('Updated src/index.ts to export from ./nxt');
  } else {
    console.log('src/index.ts already exports from ./nxt');
  }
}

async function main() {
  // Basic structure
  await ensureDir(nxtRoot);

  // REGISTRIES.md
  await writeFile('REGISTRIES.md', `
    # Registry Mechanics — NXT Framework

    This package uses a definition-driven architecture.

    - **Definitions (DTOs)** are serializable and Firestore-compatible.
    - **Implementations** are code (reducers, effects, view components, selectors).
    - **Runtime registries** are built by combining definitions + implementations.

    Core rules:

    - Definition DTOs contain no functions or DOM references.
    - Reducers (handlers) are pure functions: (state, action, config?) => nextState.
    - Effects are the only place for IO (network, persistence, timers, etc.).
    - Views are presenter-only Lit components that:
      - consume CoreContext via @lit/context
      - dispatch Actions via CoreContext.dispatch({ action, payload })
    - Registries never store DOM elements or mutate global state.
  `);

  // NXT index
  await writeFile('src/nxt/index.ts', `
    // NXT framework scaffold entrypoint
    // Expose core types and registries for progressive migration.

    export * from './runtime/actions/action';
    export * from './runtime/registries/core-registries';
    export * from './runtime/context/core-context';
  `);

  // DTOs
  await writeFile('src/nxt/definitions/dto/action-def.dto.ts', `
    export interface ActionDefDto {
      /** Unique id and canonical action name, e.g. "layout/setExpansion" */
      id: string;
      description?: string;
      /** Optional validation hints */
      payloadType?: string;
      validateSchemaRef?: string;
    }
  `);

  await writeFile('src/nxt/definitions/dto/handler-def.dto.ts', `
    export interface HandlerDefDto {
      id: string;                  // e.g. "handler:layout/setExpansion"
      action: string;              // e.g. "layout/setExpansion"
      implKey: string;             // e.g. "reducer:layout/setExpansion@1"
      description?: string;
      config?: Record<string, unknown>;
    }
  `);

  await writeFile('src/nxt/definitions/dto/effect-def.dto.ts', `
    export interface EffectDefDto {
      id: string;                  // e.g. "effect:presets/hydrate"
      forAction: string;           // e.g. "presets/hydrate"
      implKey: string;             // e.g. "effect:presets/hydrate@1"
      description?: string;
      config?: Record<string, unknown>;
    }
  `);

  await writeFile('src/nxt/definitions/dto/view-def.dto.ts', `
    export interface SelectorRefDto {
      kind: 'path' | 'fnRef';
      path?: string;
      ref?: string;
    }

    export interface ViewDefDto {
      id: string;                  // "view:firebase-auth"
      tagName: string;             // "auth-view"
      implKey?: string;            // "component:auth-view@1"
      defaultSelector?: SelectorRefDto;
      defaultSettings?: Record<string, unknown>;
      description?: string;
    }
  `);

  await writeFile('src/nxt/definitions/dto/view-instance.dto.ts', `
    import type { SelectorRefDto } from './view-def.dto';

    export interface ViewInstanceDto {
      instanceId: string;
      viewId: string;
      selector?: SelectorRefDto;
      settings?: Record<string, unknown>;
      layout?: Record<string, unknown>;
    }
  `);

  await writeFile('src/nxt/definitions/dto/selector-def.dto.ts', `
    export interface SelectorDefDto {
      id: string;                  // "selector:panel/activeView"
      implKey: string;             // "selector:panel/activeView@1"
      description?: string;
    }
  `);

  await writeFile('src/nxt/definitions/dto/definition-pack.dto.ts', `
    import type { ActionDefDto } from './action-def.dto';
    import type { HandlerDefDto } from './handler-def.dto';
    import type { EffectDefDto } from './effect-def.dto';
    import type { ViewDefDto } from './view-def.dto';
    import type { SelectorDefDto } from './selector-def.dto';

    export interface DefinitionPackDto {
      id: string;
      version: string;
      actions?: ActionDefDto[];
      handlers?: HandlerDefDto[];
      effects?: EffectDefDto[];
      views?: ViewDefDto[];
      selectors?: SelectorDefDto[];
    }
  `);

  // Loaders
  await writeFile('src/nxt/definitions/loader/apply-action-defs.ts', `
    import type { ActionDefDto } from '../dto/action-def.dto';
    import type { ActionRegistry } from '../../runtime/registries/actions/action-registry';

    export function applyActionDefs(registry: ActionRegistry, defs: ActionDefDto[]): void {
      for (const def of defs) registry.register(def);
    }
  `);

  await writeFile('src/nxt/definitions/loader/apply-handler-defs.ts', `
    import type { HandlerDefDto } from '../dto/handler-def.dto';
    import type { HandlerRegistry } from '../../runtime/registries/handlers/handler-registry';

    export function applyHandlerDefs<S>(
      registry: HandlerRegistry<S>,
      defs: HandlerDefDto[],
    ): void {
      for (const def of defs) registry.applyDefinition(def);
    }
  `);

  await writeFile('src/nxt/definitions/loader/apply-effect-defs.ts', `
    import type { EffectDefDto } from '../dto/effect-def.dto';
    import type { EffectRegistry } from '../../runtime/registries/effects/effect-registry';

    export function applyEffectDefs(
      registry: EffectRegistry,
      defs: EffectDefDto[],
    ): void {
      for (const def of defs) registry.applyDefinition(def);
    }
  `);

  await writeFile('src/nxt/definitions/loader/apply-view-defs.ts', `
    import type { ViewDefDto } from '../dto/view-def.dto';
    import type { ViewDefinitionRegistry } from '../../runtime/registries/views/view-definition-registry';

    export function applyViewDefs(
      registry: ViewDefinitionRegistry,
      defs: ViewDefDto[],
    ): void {
      for (const def of defs) registry.register(def);
    }
  `);

  await writeFile('src/nxt/definitions/loader/apply-selector-defs.ts', `
    import type { SelectorDefDto } from '../dto/selector-def.dto';
    import type { SelectorImplRegistry } from '../../runtime/registries/selectors/selector-impl-registry';

    export function applySelectorDefs<S>(
      _registry: SelectorImplRegistry<S>,
      _defs: SelectorDefDto[],
    ): void {
      // Intentionally minimal for now.
      // In a fuller implementation, this could validate that implKeys exist.
    }
  `);

  // Runtime action
  await writeFile('src/nxt/runtime/actions/action.ts', `
    export type ActionName = string;

    export interface Action<P = any> {
      action: ActionName;
      payload?: P;
      meta?: Record<string, unknown>;
    }
  `);

  // Registries: actions
  await writeFile('src/nxt/runtime/registries/actions/action-registry.ts', `
    import type { ActionDefDto } from '../../../definitions/dto/action-def.dto';

    export interface ActionRuntimeDef extends ActionDefDto {}

    export class ActionRegistry {
      private readonly defs = new Map<string, ActionRuntimeDef>();

      register(def: ActionDefDto): void {
        this.defs.set(def.id, { ...def });
      }

      get(id: string): ActionRuntimeDef | undefined {
        return this.defs.get(id);
      }

      getOrThrow(id: string): ActionRuntimeDef {
        const def = this.defs.get(id);
        if (!def) throw new Error(\`Action not registered: \${id}\`);
        return def;
      }

      entries(): ActionRuntimeDef[] {
        return [...this.defs.values()];
      }
    }
  `);

  // Registries: handlers
  await writeFile('src/nxt/runtime/registries/handlers/handler-impl-registry.ts', `
    import type { Action } from '../../actions/action';

    export type ReducerImpl<S = any, P = any> =
      (state: S, action: Action<P>, config?: Record<string, unknown>) => S;

    export class HandlerImplRegistry<S = any> {
      private readonly impls = new Map<string, ReducerImpl<S, any>>();

      register(key: string, impl: ReducerImpl<S, any>): void {
        this.impls.set(key, impl);
      }

      get(key: string): ReducerImpl<S, any> | undefined {
        return this.impls.get(key);
      }

      getOrThrow(key: string): ReducerImpl<S, any> {
        const impl = this.impls.get(key);
        if (!impl) {
          throw new Error(\`Missing handler impl: \${key}\`);
        }
        return impl;
      }
    }
  `);

  await writeFile('src/nxt/runtime/registries/handlers/handler-registry.ts', `
    import type { Action } from '../../actions/action';
    import type { HandlerDefDto } from '../../../definitions/dto/handler-def.dto';
    import type { ReducerImpl } from './handler-impl-registry';
    import { HandlerImplRegistry } from './handler-impl-registry';

    export interface HandlerRuntimeEntry<S = any> {
      id: string;
      action: string;
      reduce: ReducerImpl<S, any>;
      config?: Record<string, unknown>;
      description?: string;
    }

    export class HandlerRegistry<S = any> {
      private readonly byAction = new Map<string, HandlerRuntimeEntry<S>[]>();

      constructor(private readonly impls: HandlerImplRegistry<S>) {}

      applyDefinition(def: HandlerDefDto): void {
        const reduce = this.impls.getOrThrow(def.implKey);
        const entry: HandlerRuntimeEntry<S> = {
          id: def.id,
          action: def.action,
          reduce,
          config: def.config,
          description: def.description,
        };
        const list = this.byAction.get(def.action) ?? [];
        list.push(entry);
        this.byAction.set(def.action, list);
      }

      getForAction(action: string): HandlerRuntimeEntry<S>[] {
        return this.byAction.get(action) ?? [];
      }
    }
  `);

  // Registries: effects
  await writeFile('src/nxt/runtime/registries/effects/effect-impl-registry.ts', `
    import type { Action } from '../../actions/action';

    export type EffectImpl<P = any> =
      (action: Action<P>, dispatch: (a: Action<any>) => void, config?: Record<string, unknown>) =>
        void | Promise<void>;

    export class EffectImplRegistry {
      private readonly impls = new Map<string, EffectImpl<any>>();

      register(key: string, impl: EffectImpl<any>): void {
        this.impls.set(key, impl);
      }

      getOrThrow(key: string): EffectImpl<any> {
        const impl = this.impls.get(key);
        if (!impl) {
          throw new Error(\`Missing effect impl: \${key}\`);
        }
        return impl;
      }
    }
  `);

  await writeFile('src/nxt/runtime/registries/effects/effect-registry.ts', `
    import type { Action } from '../../actions/action';
    import type { EffectDefDto } from '../../../definitions/dto/effect-def.dto';
    import { EffectImplRegistry, type EffectImpl } from './effect-impl-registry';

    export interface EffectRuntimeEntry {
      id: string;
      forAction: string;
      run: EffectImpl<any>;
      config?: Record<string, unknown>;
      description?: string;
    }

    export class EffectRegistry {
      private readonly byAction = new Map<string, EffectRuntimeEntry[]>();

      constructor(private readonly impls: EffectImplRegistry) {}

      applyDefinition(def: EffectDefDto): void {
        const run = this.impls.getOrThrow(def.implKey);
        const entry: EffectRuntimeEntry = {
          id: def.id,
          forAction: def.forAction,
          run,
          config: def.config,
          description: def.description,
        };
        const list = this.byAction.get(def.forAction) ?? [];
        list.push(entry);
        this.byAction.set(def.forAction, list);
      }

      getForAction(action: string): EffectRuntimeEntry[] {
        return this.byAction.get(action) ?? [];
      }

      async runForAction(action: Action<any>, dispatch: (a: Action<any>) => void): Promise<void> {
        const list = this.getForAction(action.action);
        for (const entry of list) {
          await entry.run(action, dispatch, entry.config);
        }
      }
    }
  `);

  // Registries: views
  await writeFile('src/nxt/runtime/registries/views/view-definition-registry.ts', `
    import type { ViewDefDto } from '../../../definitions/dto/view-def.dto';

    export interface ViewRuntimeDef extends ViewDefDto {}

    export class ViewDefinitionRegistry {
      private readonly defs = new Map<string, ViewRuntimeDef>();

      register(def: ViewDefDto): void {
        this.defs.set(def.id, { ...def });
      }

      get(id: string): ViewRuntimeDef | undefined {
        return this.defs.get(id);
      }

      getOrThrow(id: string): ViewRuntimeDef {
        const def = this.defs.get(id);
        if (!def) {
          throw new Error(\`View not registered: \${id}\`);
        }
        return def;
      }

      entries(): ViewRuntimeDef[] {
        return [...this.defs.values()];
      }
    }
  `);

  await writeFile('src/nxt/runtime/registries/views/view-impl-registry.ts', `
    export interface ViewImpl {
      tagName: string;
      preload?: () => Promise<void>;
    }

    export class ViewImplRegistry {
      private readonly impls = new Map<string, ViewImpl>();

      register(key: string, impl: ViewImpl): void {
        this.impls.set(key, impl);
      }

      getOrThrow(key: string): ViewImpl {
        const impl = this.impls.get(key);
        if (!impl) {
          throw new Error(\`Missing view impl: \${key}\`);
        }
        return impl;
      }
    }
  `);

  // Registries: selectors
  await writeFile('src/nxt/runtime/registries/selectors/selector-impl-registry.ts', `
    export type SelectorImpl<S = any, R = any> = (state: S) => R;

    export class SelectorImplRegistry<S = any> {
      private readonly impls = new Map<string, SelectorImpl<S, any>>();

      register(key: string, impl: SelectorImpl<S, any>): void {
        this.impls.set(key, impl);
      }

      getOrThrow(key: string): SelectorImpl<S, any> {
        const impl = this.impls.get(key);
        if (!impl) {
          throw new Error(\`Missing selector impl: \${key}\`);
        }
        return impl;
      }
    }
  `);

  // CoreRegistries
  await writeFile('src/nxt/runtime/registries/core-registries.ts', `
    import { ActionRegistry } from './actions/action-registry';
    import { HandlerImplRegistry } from './handlers/handler-impl-registry';
    import { HandlerRegistry } from './handlers/handler-registry';
    import { EffectImplRegistry } from './effects/effect-impl-registry';
    import { EffectRegistry } from './effects/effect-registry';
    import { ViewDefinitionRegistry } from './views/view-definition-registry';
    import { ViewImplRegistry } from './views/view-impl-registry';
    import { SelectorImplRegistry } from './selectors/selector-impl-registry';

    export class CoreRegistries<S = any> {
      readonly actions = new ActionRegistry();
      readonly handlerImpls = new HandlerImplRegistry<S>();
      readonly handlers = new HandlerRegistry<S>(this.handlerImpls);
      readonly effectImpls = new EffectImplRegistry();
      readonly effects = new EffectRegistry(this.effectImpls);
      readonly viewDefs = new ViewDefinitionRegistry();
      readonly viewImpls = new ViewImplRegistry();
      readonly selectorImpls = new SelectorImplRegistry<S>();
    }
  `);

  // Engine dispatch
  await writeFile('src/nxt/runtime/engine/dispatch/dispatch-action.ts', `
    import type { Action } from '../../actions/action';
    import type { CoreRegistries } from '../../registries/core-registries';

    export interface DispatchEnv<S> {
      registries: CoreRegistries<S>;
      getState(): S;
      setState(next: S): void;
    }

    export function dispatchAction<S>(env: DispatchEnv<S>, action: Action<any>): void {
      const { registries, getState, setState } = env;
      const handlers = registries.handlers.getForAction(action.action);
      if (!handlers.length) return;

      let state = getState();
      for (const entry of handlers) {
        state = entry.reduce(state, action, entry.config);
      }
      setState(state);

      void registries.effects.runForAction(action, (a) => dispatchAction(env, a));
    }
  `);

  // State store + validation
  await writeFile('src/nxt/runtime/state/store/ui-state-store.ts', `
    export type Subscriber<S> = (state: S) => void;

    export class UiStateStore<S> {
      private state: S;
      private readonly subscribers = new Set<Subscriber<S>>();

      constructor(initial: S) {
        this.state = initial;
      }

      getState(): S {
        return this.state;
      }

      setState(next: S): void {
        this.state = next;
        for (const sub of this.subscribers) sub(this.state);
      }

      subscribe(fn: Subscriber<S>): () => void {
        this.subscribers.add(fn);
        fn(this.state);
        return () => this.subscribers.delete(fn);
      }
    }
  `);

  await writeFile('src/nxt/runtime/state/validation/validate-state.ts', `
    // Placeholder for state validation.
    // In dev builds this can assert shape invariants for the framework state.
    export function validateState<S>(_state: S): void {
      // no-op by default
    }
  `);

  // CoreContext + context key
  await writeFile('src/nxt/runtime/context/core-context.ts', `
    import type { Action } from '../actions/action';
    import { dispatchAction } from '../engine/dispatch/dispatch-action';
    import { CoreRegistries } from '../registries/core-registries';
    import { UiStateStore } from '../state/store/ui-state-store';
    import { validateState } from '../state/validation/validate-state';

    export class CoreContext<S> {
      readonly registries: CoreRegistries<S>;
      readonly store: UiStateStore<S>;

      constructor(initialState: S) {
        this.registries = new CoreRegistries<S>();
        this.store = new UiStateStore<S>(initialState);
      }

      getState(): S {
        return this.store.getState();
      }

      dispatch(action: Action<any>): void {
        const env = {
          registries: this.registries,
          getState: () => this.store.getState(),
          setState: (next: S) => {
            validateState(next);
            this.store.setState(next);
          },
        };
        dispatchAction(env, action);
      }
    }
  `);

  await writeFile('src/nxt/runtime/context/core-context-key.ts', `
    import { createContext } from '@lit/context';
    import type { CoreContext } from './core-context';

    export const coreContext = createContext<CoreContext<any>>('nxt-core-context');
  `);

  // Simple runtime index (optional aggregator)
  await writeFile('src/nxt/runtime/index.ts', `
    export * from './actions/action';
    export * from './registries/core-registries';
    export * from './context/core-context';
    export * from './context/core-context-key';
  `);

  await upsertFrameworkIndex();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
