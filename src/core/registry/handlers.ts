export type HandlerRegistryEntry = {
  id: string;
  module: string;
  entrypoint: string;
  acceptsMessages?: boolean;
};

export const handlersRegistry: HandlerRegistryEntry[] = [
  { id: 'ai', module: 'src/handlers/ai', entrypoint: 'createGeminiHandlers', acceptsMessages: true },
  { id: 'projects', module: 'src/handlers/projects', entrypoint: 'createProjectHandlers', acceptsMessages: true },
  { id: 'workspace', module: 'src/handlers/workspace', entrypoint: 'createPanelHandlers', acceptsMessages: true },
  { id: 'workspace-ui', module: 'src/handlers/workspace', entrypoint: 'createWorkspaceUiEventHandlers', acceptsMessages: true },
  { id: 'layout', module: 'src/handlers/layout', entrypoint: 'createViewControlsHandlers', acceptsMessages: true },
  { id: 'state', module: 'src/handlers/state', entrypoint: 'createUiContextHandlers', acceptsMessages: true },
];
