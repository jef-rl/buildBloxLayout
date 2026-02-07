import { ContextProvider } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import type { ViewDefDto } from '../src/definitions/dto/view-def.dto';
import { CoreContext } from '../src/runtime/context/core-context';
import { coreContext } from '../src/runtime/context/core-context-key';
import type { UIState } from '../src/types/state';
import { WorkspaceRoot } from '../src/views/components/WorkspaceRoot.js';
import { AuthView } from '../src/views/components/AuthView.js';
import { LogView } from '../src/views/components/LogView.js';
import { ToolbarContainer } from '../src/views/components/ToolbarContainer.js';
import { CustomToolbar } from '../src/views/components/CustomToolbar.js';

export type SimpleViewConfig = {
  id: string;
  component: CustomElementConstructor;
  tag: string;
  icon?: string;
  name?: string;
  title?: string;
  defaultContext?: Record<string, unknown>;
};

export type FrameworkConfig = {
  initialState: UIState;
  auth?: Record<string, unknown>;
  logging?: 'console' | 'silent';
};

type ViewRuntimeConfig = SimpleViewConfig & {
  implKey?: string;
};

const BUILT_IN_VIEWS: ViewRuntimeConfig[] = [
  {
    id: 'firebase-auth',
    component: AuthView,
    tag: 'auth-view',
    icon: 'person',
    name: 'Firebase Auth',
    title: 'Firebase Auth',
  },
  {
    id: 'framework-logs',
    component: LogView,
    tag: 'log-view',
    icon: 'terminal',
    name: 'Framework Logs',
    title: 'Framework Logs',
  },
  {
    id: 'generic-toolbar',
    component: ToolbarContainer,
    tag: 'toolbar-container',
    icon: 'view_compact',
    name: 'Toolbar',
    title: 'Toolbar',
  },
  {
    id: 'custom-toolbar',
    component: CustomToolbar,
    tag: 'custom-toolbar',
    icon: 'apps',
    name: 'Custom Toolbar',
    title: 'Custom Toolbar',
  },
];

class FrameworkRoot extends LitElement {
  @property({ attribute: false }) core?: CoreContext<UIState>;
  private provider = new ContextProvider(this, {
    context: coreContext,
  });

  configureFirestore(_db: unknown) {
    // Placeholder for Firebase integration in the playground.
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has('core') && this.core) {
      this.provider.setValue(this.core);
    }
  }

  render() {
    return html`<workspace-root></workspace-root>`;
  }
}

if (!customElements.get('framework-root')) {
  customElements.define('framework-root', FrameworkRoot);
}

export class Framework {
  static configure(config: FrameworkConfig): FrameworkBuilder {
    return new FrameworkBuilder(config);
  }
}

export class FrameworkBuilder {
  private readonly core: CoreContext<UIState>;
  private readonly customViews: ViewRuntimeConfig[] = [];

  constructor(private readonly config: FrameworkConfig) {
    this.core = new CoreContext<UIState>(config.initialState);
  }

  registerViews(views: SimpleViewConfig[]): this {
    this.customViews.push(...views);
    return this;
  }

  init(): FrameworkRoot {
    this.registerViewDefinitions(BUILT_IN_VIEWS);
    this.registerViewDefinitions(this.customViews);

    const root = document.createElement('framework-root') as FrameworkRoot;
    root.core = this.core;

    if (!document.body.contains(root)) {
      document.body.appendChild(root);
    }

    return root;
  }

  private registerViewDefinitions(views: ViewRuntimeConfig[]): void {
    for (const view of views) {
      const implKey = view.implKey ?? view.id;
      const def: ViewDefDto = {
        id: view.id,
        tagName: view.tag,
        implKey,
        name: view.name ?? view.id,
        title: view.title ?? view.name ?? view.id,
        icon: view.icon ?? '',
        defaultContext: view.defaultContext,
      };
      this.core.registries.viewDefs.register(def);
      this.core.registries.viewImpls.register(implKey, {
        tagName: view.tag,
        preload: async () => view.component,
      });
    }
  }
}

// Ensure built-in components are registered.
void WorkspaceRoot;
