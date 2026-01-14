import type { UiState } from '../../core/state/ui-state.js';
import type { ViewRegistryEntry } from '../../core/registry/views';

export function selectIsPanelEnabled(state: UiState, panel: ViewRegistryEntry): boolean {
  if (!panel.id) return false;
  if (panel.featureFlag) {
    return !!state.featureFlags?.[panel.featureFlag];
  }
  return true;
}

export function selectOpenPanelCount(state: UiState, panelRegistry: ViewRegistryEntry[]): number {
  return panelRegistry.filter((panel) => selectIsPanelEnabled(state, panel) && state.panels.open[panel.id as keyof typeof state.panels.open]).length;
}

export function selectComputedLayoutWidth(state: UiState, panelRegistry: ViewRegistryEntry[]): string {
  const mode = state.layout.viewportWidthMode;
  
  // Calculate available width for MAIN area
  let availableWidth = 100;
  if (state.layout.expansion?.left) availableWidth -= 25;
  if (state.layout.expansion?.right) availableWidth -= 25;

  let perPanelVw = 100;

  if (mode !== 'auto') {
    switch (mode) {
      case '1x':
        perPanelVw = 100;
        break;
      case '2x':
        perPanelVw = 50;
        break;
      case '3x':
        perPanelVw = 100 / 3;
        break;
      case '4x':
        perPanelVw = 25;
        break;
      case '5x':
        perPanelVw = 20;
        break;
      default: {
        const mult = parseInt(mode, 10);
        perPanelVw = Number.isNaN(mult) ? 100 : 100 / mult;
        break;
      }
    }
  }

  // Adjust vw based on available width factor
  // availableWidth is 100, 75, or 50.
  // factor is availableWidth / 100.
  // We want the visual result to look like "5 columns fit in the current view".
  // Current view width is (availableWidth)vw.
  // So each column width should be (availableWidth / count)vw.
  // perPanelVw (e.g., 20 for 5x) assumes 100vw total.
  // So correct width = perPanelVw * (availableWidth / 100).
  
  const factor = availableWidth / 100;
  const finalVw = perPanelVw * factor;

  return `${finalVw}vw`;
}

export function selectGeneratedCode(state: UiState): string {
  const visualBlockState = state.panels.data['visual-editor']?.visualBlockState;
  if (!visualBlockState) return '';

  if (visualBlockState.renderOutput) {
    return visualBlockState.renderOutput;
  }

  return `export const visualBlockData = ${visualBlockState.serializedData || '{}'};`;
}

export function buildAiInstructionMap(panelRegistry: ViewRegistryEntry[]): Record<string, string> {
  return panelRegistry.reduce<Record<string, string>>((acc, entry) => {
    if (entry.id && entry.systemInstruction) {
      acc[entry.id] = entry.systemInstruction;
    }
    return acc;
  }, {});
}
