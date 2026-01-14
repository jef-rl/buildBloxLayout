import { viewsRegistry } from '../../core/registry/views';

export type PanelId = 'scope' | 'template' | 'styles' | 'preview' | 'export' | string;
export type PanelType = 'scope' | 'editor' | 'preview' | 'export' | 'content';

export interface PanelFeatureFlags {
    aiCapable: boolean;
    requiresScope: boolean;
}

export interface PanelPropBinding {
    prop: string;
    stateKey: string;
    description?: string;
}

export interface PanelEventBinding {
    event: string;
    handler: string;
    description?: string;
}

export interface PanelDataBindings {
    props: PanelPropBinding[];
    events: PanelEventBinding[];
}

export interface PanelDefinition<TProps = Record<string, unknown>> {
    id: PanelId;
    label: string;
    tag: string;
    type: PanelType;
    defaultOpen: boolean;
    featureFlags: PanelFeatureFlags;
    dataBindings: PanelDataBindings;
    propsTemplate?: TProps;
}

export interface ContentPanelDefinition<TProps = Record<string, unknown>> extends PanelDefinition<TProps> {
    type: 'content';
    renderer?: ((props: TProps) => unknown) | null;
}

export type PanelRegistryEntry = PanelDefinition | ContentPanelDefinition;
export type PanelRegistry = Record<string, PanelRegistryEntry>;

const viewLabelMap = new Map(
    viewsRegistry
        .filter((view) => view.panelId)
        .map((view) => [view.panelId as PanelId, view.label])
);

export const PANELS_CONFIG: PanelRegistry = {
    scope: {
        id: 'scope',
        label: viewLabelMap.get('scope') ?? 'Scope',
        tag: 'app-panel-scope',
        type: 'scope',
        defaultOpen: true,
        featureFlags: {
            aiCapable: true,
            requiresScope: false,
        },
        dataBindings: {
            props: [
                { prop: 'open', stateKey: 'scopeOpen', description: 'Panel visibility' },
                { prop: 'mode', stateKey: 'scopeMode', description: 'View mode toggle' },
                { prop: 'jsonInput', stateKey: 'jsonInput', description: 'Raw JSON string' },
                { prop: 'jsonError', stateKey: 'jsonError', description: 'Validation error text' },
                { prop: 'parsedScope', stateKey: 'parsedScope', description: 'Parsed JSON object' },
            ],
            events: [
                { event: 'set-mode', handler: 'setScopeMode', description: 'Switch between text/visual mode' },
                { event: 'json-change', handler: 'handleJsonChange', description: 'Handle JSON textarea edits' },
                { event: 'scope-update', handler: 'handleScopeUpdate', description: 'Handle visual editor updates' },
                { event: 'open-ai', handler: 'openAiModal("scope")', description: 'Launch AI assistant for scope' },
            ],
        },
    },
    template: {
        id: 'template',
        label: viewLabelMap.get('template') ?? 'Template',
        tag: 'app-panel-editor',
        type: 'editor',
        defaultOpen: true,
        featureFlags: {
            aiCapable: true,
            requiresScope: true,
        },
        dataBindings: {
            props: [
                { prop: 'open', stateKey: 'templateOpen', description: 'Panel visibility' },
                { prop: 'value', stateKey: 'templateInput', description: 'HTML template source' },
                { prop: 'placeholder', stateKey: 'templatePlaceholder', description: 'Helper placeholder text' },
                { prop: 'aiTitle', stateKey: 'templateAiTitle', description: 'Tooltip for AI action' },
            ],
            events: [
                { event: 'change', handler: 'handleTemplateChange', description: 'Handle template edits' },
                { event: 'open-ai', handler: 'openAiModal("template")', description: 'Launch AI assistant for template' },
            ],
        },
        propsTemplate: {
            placeholder: 'Enter HTML template here...',
            aiTitle: 'Draft Template with Gemini',
        },
    },
    styles: {
        id: 'styles',
        label: viewLabelMap.get('styles') ?? 'Styles',
        tag: 'app-panel-editor',
        type: 'editor',
        defaultOpen: true,
        featureFlags: {
            aiCapable: true,
            requiresScope: true,
        },
        dataBindings: {
            props: [
                { prop: 'open', stateKey: 'stylesOpen', description: 'Panel visibility' },
                { prop: 'value', stateKey: 'stylesInput', description: 'CSS source' },
                { prop: 'placeholder', stateKey: 'stylesPlaceholder', description: 'Helper placeholder text' },
                { prop: 'textColor', stateKey: 'stylesTextColor', description: 'Theming helper color' },
                { prop: 'aiTitle', stateKey: 'stylesAiTitle', description: 'Tooltip for AI action' },
            ],
            events: [
                { event: 'change', handler: 'handleStylesChange', description: 'Handle CSS edits' },
                { event: 'open-ai', handler: 'openAiModal("styles")', description: 'Launch AI assistant for styles' },
            ],
        },
        propsTemplate: {
            placeholder: 'Enter CSS styles here...',
            textColor: '#ddd6fe',
            aiTitle: 'Generate Styles with Gemini',
        },
    },
    preview: {
        id: 'preview',
        label: viewLabelMap.get('preview') ?? 'Preview',
        tag: 'app-panel-preview',
        type: 'preview',
        defaultOpen: true,
        featureFlags: {
            aiCapable: false,
            requiresScope: true,
        },
        dataBindings: {
            props: [
                { prop: 'open', stateKey: 'previewOpen', description: 'Panel visibility' },
                { prop: 'stylesInput', stateKey: 'stylesInput', description: 'CSS applied to preview frame' },
                { prop: 'renderedHtml', stateKey: 'renderedHtml', description: 'Rendered HTML output' },
                { prop: 'renderError', stateKey: 'renderError', description: 'Preview error indicator' },
            ],
            events: [],
        },
    },
    'visual-editor': {
        id: 'visual-editor',
        label: viewLabelMap.get('visual-editor') ?? 'Visual Editor',
        tag: 'visual-block-editor',
        type: 'content',
        defaultOpen: false,
        featureFlags: {
            aiCapable: false,
            requiresScope: false,
        },
        dataBindings: {
            props: [],
            events: [],
        },
    },
    'visual-render': {
        id: 'visual-render',
        label: viewLabelMap.get('visual-render') ?? 'Visual Render',
        tag: 'visual-block-render',
        type: 'content',
        defaultOpen: false,
        featureFlags: {
            aiCapable: false,
            requiresScope: false,
        },
        dataBindings: {
            props: [],
            events: [],
        },
    },
    'visual-preview': {
        id: 'visual-preview',
        label: viewLabelMap.get('visual-preview') ?? 'Visual Preview',
        tag: 'visual-block-preview',
        type: 'content',
        defaultOpen: false,
        featureFlags: {
            aiCapable: false,
            requiresScope: false,
        },
        dataBindings: {
            props: [],
            events: [],
        },
    },
    'visual-projection': {
        id: 'visual-projection',
        label: viewLabelMap.get('visual-projection') ?? 'Visual Projection',
        tag: 'visual-block-projection',
        type: 'content',
        defaultOpen: false,
        featureFlags: {
            aiCapable: false,
            requiresScope: false,
        },
        dataBindings: {
            props: [],
            events: [],
        },
    },
    'visual-inspector': {
        id: 'visual-inspector',
        label: viewLabelMap.get('visual-inspector') ?? 'Visual Inspector',
        tag: 'visual-block-inspector',
        type: 'content',
        defaultOpen: false,
        featureFlags: {
            aiCapable: false,
            requiresScope: false,
        },
        dataBindings: {
            props: [],
            events: [],
        },
    },
    export: {
        id: 'export',
        label: viewLabelMap.get('export') ?? 'Export',
        tag: 'app-panel-export',
        type: 'export',
        defaultOpen: false,
        featureFlags: {
            aiCapable: false,
            requiresScope: true,
        },
        dataBindings: {
            props: [
                { prop: 'open', stateKey: 'exportOpen', description: 'Panel visibility' },
                { prop: 'generatedCode', stateKey: 'generatedCode', description: 'Combined output for export' },
            ],
            events: [
                { event: 'copy-code', handler: 'copyExportCode', description: 'Copy generated code to clipboard' },
            ],
        },
    },
    // Future panel hook: allows registration of custom content without touching app-root
    content: {
        id: 'content',
        label: 'Custom Content',
        tag: 'app-panel-content',
        type: 'content',
        defaultOpen: false,
        featureFlags: {
            aiCapable: false,
            requiresScope: false,
        },
        dataBindings: {
            props: [],
            events: [],
        },
        renderer: null,
        propsTemplate: {},
    },
};

export const VIEW_PANEL_ORDER: PanelId[] = viewsRegistry
    .filter((view) => view.panelId)
    .map((view) => view.panelId as PanelId);
export const PANEL_ORDER: PanelId[] = VIEW_PANEL_ORDER;

export const AI_CAPABLE_PANELS = Object.values(PANELS_CONFIG)
    .filter((panel) => panel.featureFlags.aiCapable)
    .map((panel) => panel.id);
