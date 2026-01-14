import { emitPanelEvent } from './shared.js';

export function createExportPanelHandlers(host: HTMLElement) {
  return {
    copyCode: () => emitPanelEvent(host, 'copy-code'),
  };
}

export type ExportPanelHandlers = ReturnType<typeof createExportPanelHandlers>;
