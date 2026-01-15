
import type {
    LayoutState,
    Panel,
    PanelContainer,
    UIState,
    View,
} from '../types/index';

export type { LayoutExpansion, LayoutState, MainAreaPanelCount, ToolbarState, UIState } from '../types/ui-state';
export type { ViewportWidthMode } from '../types/core';

export interface UiStateContextValue {
  state: UIState;
  dispatch: (payload: { type: string; [key: string]: unknown }) => void;
}

export class UiState {
    private state: UIState = {
        containers: [],
        panels: [],
        views: [],
        activeView: null,
        layout: {
            expansion: { left: false, right: false, bottom: false },
            overlayView: null,
            viewportWidthMode: 'auto',
            mainAreaCount: 1,
        },
        toolbars: {
            positions: {},
            activePicker: null,
        },
        dock: {},
        theme: {},
    };

    getState(): UIState {
        return this.state;
    }

    get panels(): Panel[] {
        return this.state.panels;
    }

    get views(): View[] {
        return this.state.views;
    }

    get activeView(): string | null {
        return this.state.activeView;
    }

    get dock(): any {
        return this.state.dock;
    }

    get theme(): any {
        return this.state.theme;
    }

    get layout(): LayoutState {
        return this.state.layout;
    }

    get toolbars() {
        return this.state.toolbars;
    }

    get containers(): PanelContainer[] {
        return this.state.containers;
    }

    getContainer(containerId: string): PanelContainer | undefined {
        return this.state.containers.find(c => c.id === containerId);
    }

    findContainerByPanel(panelId: string): PanelContainer | undefined {
        return this.state.containers.find(c => c.panels.some(p => p.id === panelId));
    }

    findPanel(panelId: string): Panel | undefined {
        return this.state.panels.find(p => p.id === panelId);
    }

    update(nextState: UIState): void {
        this.state = nextState;
    }
}

export const uiState = new UiState();
