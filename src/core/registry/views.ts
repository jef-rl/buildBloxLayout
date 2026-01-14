import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import type { UiDispatch, UiState } from '../state/ui-state.js';
import type { ViewId } from '../types/index.js';

export type ViewControlStatusKey = 'jsonError' | 'renderError' | 'exportError';

export type ViewControlConfig = {
  title: string;
  icon: TemplateResult;
  statusKey?: ViewControlStatusKey;
  statusPing?: boolean;
  variant?: 'scope' | 'default';
  separatorAfter?: boolean;
};

export type ViewRenderContext = {
  getPanelData: (panelId: string) => Record<string, any>;
  getPanelOpen: (panelId: string) => boolean;
  getComputedLayoutWidth: () => string;
  getTemplateInput: () => string;
  getStylesInput: () => string;
  getRenderedHtml: () => string;
  getRenderError: () => string;
  getGeneratedCode: () => string;
  getViewState: () => UiState['view'];
  openView: (viewId: ViewId, config?: ViewOpenConfig) => void;
  closeView: () => void;
  isViewCloseDisabled: (viewId: ViewId, options?: Record<string, unknown>) => boolean;
  panelHandlers: () => {
    setScopeMode: (mode: string) => void;
    handleJsonChange: (value: string) => void;
    handleScopeUpdate: (value: unknown) => void;
    handleTemplateChange: (value: string) => void;
    handleStylesChange: (value: string) => void;
  };
  aiHandlers: () => { openAiModal: (panelId: string) => void } | undefined;
  copyExportCode: () => void;
  viewRenderers?: () => {
    renderAiPromptView: () => unknown;
    renderSettingsView: () => unknown;
    renderProjectSaveView: (close: () => void) => unknown;
    renderProjectLibraryView: (openView: (viewId: ViewId, config?: ViewOpenConfig) => void, close: () => void) => unknown;
    renderProjectPasteView: () => unknown;
  };
};

export type ViewOpenConfig = {
  payload?: unknown;
  options?: Record<string, unknown>;
};

export type ViewRenderParams = {
  state: UiState;
  dispatch?: UiDispatch;
  closeView: () => void;
  openView: (viewId: ViewId, config?: ViewOpenConfig) => void;
};

export type ViewRegistryEntry = {
  id: string;
  label: string;
  panelId?: string;
  rendersInPanel: boolean;
  controls?: ViewControlConfig;
  featureFlag?: string;
  systemInstruction?: string;
  hasAi?: boolean;
  validation?: () => boolean;
  decorateInstruction?: (instruction: string) => string;
  getPromptContext?: () => string;
  onGenerate?: (content: string) => void;
  renderPanel?: () => unknown;
  renderView?: (params: ViewRenderParams) => unknown;
  viewTitle?: string;
  viewSize?: 'medium' | 'large';
};

export const viewsRegistry: ViewRegistryEntry[] = [
  {
    id: 'scope',
    label: 'Scope',
    panelId: 'scope',
    rendersInPanel: true,
    controls: {
      title: 'Toggle JSON Scope',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>`,
      statusKey: 'jsonError',
      statusPing: true,
      variant: 'scope',
      separatorAfter: true,
    },
    hasAi: true,
    systemInstruction:
      "You are a JSON data generator. Return ONLY a valid JSON object based on the user's request. Do not wrap it in markdown code blocks or add comments.",
  },
  {
    id: 'template',
    label: 'Template',
    panelId: 'template',
    rendersInPanel: true,
    controls: {
      title: 'Toggle Template Editor',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>`,
      statusKey: 'renderError',
      statusPing: true,
    },
    hasAi: true,
    systemInstruction:
      'You are a Lit-HTML template generator. Generate only the HTML content block using the variables provided in the scope. Return ONLY the HTML string. DO NOT include <style>, <script>, <html>, <head>, <body>, or markdown code blocks.',
  },
  {
    id: 'styles',
    label: 'Styles',
    panelId: 'styles',
    rendersInPanel: true,
    controls: {
      title: 'Toggle CSS Styles',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>`,
      separatorAfter: true,
    },
    hasAi: true,
    systemInstruction:
      'You are a CSS generator. Generate CSS rules for an HTML component. Return ONLY the CSS string. Do not wrap in markdown or include <style> tags.',
  },
  {
    id: 'preview',
    label: 'Preview',
    panelId: 'preview',
    rendersInPanel: true,
    controls: {
      title: 'Toggle Preview',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>`,
      statusKey: 'renderError',
    },
  },
  {
    id: 'visual-editor',
    label: 'Visual Editor',
    panelId: 'visual-editor',
    rendersInPanel: true,
    controls: {
      title: 'Toggle Visual Editor',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4h9m-9 0a2 2 0 00-2 2v12m11-14v14a2 2 0 01-2 2H7m4-16l-2 2m0 0l-2 2m2-2l2 2m-2-2l-2-2" />
      </svg>`,
    },
  },
  {
    id: 'visual-render',
    label: 'Visual Render',
    panelId: 'visual-render',
    rendersInPanel: true,
    controls: {
      title: 'Toggle Visual Render',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v18l15-9L5 3z" />
      </svg>`,
    },
  },
  {
    id: 'visual-preview',
    label: 'Visual Preview',
    panelId: 'visual-preview',
    rendersInPanel: true,
    controls: {
      title: 'Toggle Visual Preview',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v14H3z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 21h8" />
      </svg>`,
    },
  },
  {
    id: 'visual-projection',
    label: 'Visual Projection',
    panelId: 'visual-projection',
    rendersInPanel: true,
    controls: {
      title: 'Toggle Visual Projection',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8l8-4 8 4-8 4-8-4z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12l8 4 8-4" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l8 4 8-4" />
      </svg>`,
    },
  },
  {
    id: 'export',
    label: 'Export',
    panelId: 'export',
    rendersInPanel: true,
    controls: {
      title: 'Export Function',
      icon: html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
      </svg>`,
      statusKey: 'exportError',
      statusPing: true,
    },
  },
  {
    id: 'project-save',
    label: 'Save Project',
    rendersInPanel: false,
    viewTitle: 'Save Project',
  },
  {
    id: 'open-library',
    label: 'Project Library',
    rendersInPanel: false,
    viewTitle: 'Project Library',
  },
  {
    id: 'import-paste',
    label: 'Import Project File',
    rendersInPanel: false,
    viewTitle: 'Import Project File',
  },
  {
    id: 'ai-prompt',
    label: 'AI Prompt',
    rendersInPanel: false,
    viewTitle: '✨ AI Assistant',
  },
  {
    id: 'settings',
    label: 'AI System Instructions',
    rendersInPanel: false,
    viewTitle: 'AI System Instructions',
    viewSize: 'large',
  },
];

export const createViewsRegistry = (context: ViewRenderContext): ViewRegistryEntry[] =>
  viewsRegistry.map((view) => {
  if (!view.panelId) {
    const viewRenderMap: Record<string, () => unknown> = {
      'project-save': () => context.viewRenderers?.()?.renderProjectSaveView?.(context.closeView) ?? nothing,
      'open-library': () =>
        context.viewRenderers?.()?.renderProjectLibraryView?.(context.openView, context.closeView) ?? nothing,
      'import-paste': () => context.viewRenderers?.()?.renderProjectPasteView?.() ?? nothing,
      'ai-prompt': () => context.viewRenderers?.()?.renderAiPromptView?.() ?? nothing,
      settings: () => context.viewRenderers?.()?.renderSettingsView?.() ?? nothing,
    };

    const renderContent = viewRenderMap[view.id];
    if (!renderContent) return view;

    return {
      ...view,
      panelId: view.id,
      rendersInPanel: true,
      renderPanel: () => {
        const viewState = context.getViewState();
        const options = viewState?.viewOptions ?? {};
        const open = context.getPanelOpen(view.id);
        if (!open) return nothing;

        return html`
          <panel-view
            class="panel-host"
            style="width: ${context.getComputedLayoutWidth()}"
            .viewId="${view.id}"
          >
            ${renderContent()}
          </panel-view>
        `;
      },
    };
  }

    const panelId = view.panelId;
    const getPanelOpen = context.getPanelOpen;

    const renderers: Record<string, () => unknown> = {
      scope: () => html` <panel-scope class="panel-host"></panel-scope> `,
      template: () => html`
        <panel-editor
          class="panel-host"
          .panelId="${'template'}"
          placeholder="Enter HTML template here..."
          aiTitle="Draft Template with Gemini"
        ></panel-editor>
      `,
      styles: () => html`
        <panel-editor
          class="panel-host"
          .panelId="${'styles'}"
          placeholder="Enter CSS styles here..."
          aiTitle="Generate Styles with Gemini"
          .textColor="${'#ddd6fe'}"
        ></panel-editor>
      `,
      preview: () => html`
        <panel-preview class="panel-host"></panel-preview>
      `,
      export: () => html`
        <panel-export
          class="panel-host"
          @copy-code="${() => context.copyExportCode()}"
        ></panel-export>
      `,
      'visual-editor': () => html`
        <panel-visual-block class="panel-host" mode="design"></panel-visual-block>
      `,
      'visual-render': () => html`
        <panel-visual-block class="panel-host" mode="render"></panel-visual-block>
      `,
      'visual-preview': () => html`
        <panel-visual-block class="panel-host" mode="preview"></panel-visual-block>
      `,
      'visual-projection': () => html`
        <panel-visual-block class="panel-host" mode="projection"></panel-visual-block>
      `,
    };

    const renderPanel = renderers[panelId] ?? (() => nothing);

    const instructionHandlers: Record<string, Partial<ViewRegistryEntry>> = {
      scope: {
        decorateInstruction: undefined,
        getPromptContext: undefined,
        onGenerate: (content: string) => context.panelHandlers().handleJsonChange(content),
        validation: () => true,
      },
      template: {
        decorateInstruction: (instruction: string) => `Available keys: [${Object.keys(context.getPanelData('scope').parsedScope || {}).join(', ')}]. ${instruction}`,
        getPromptContext: () => `Context HTML: ${context.getTemplateInput().slice(0, 500)}...`,
        onGenerate: (content: string) => context.panelHandlers().handleTemplateChange(content),
      },
      styles: {
        getPromptContext: () => `Context HTML: ${context.getTemplateInput().slice(0, 500)}...`,
        onGenerate: (content: string) => context.panelHandlers().handleStylesChange(content),
      },
    };

    return {
      ...view,
      renderPanel,
      ...instructionHandlers[panelId],
    } as ViewRegistryEntry;
  });
