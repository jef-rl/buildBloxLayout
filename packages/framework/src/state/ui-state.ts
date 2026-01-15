
import type { Panel, PanelContainer, View } from '../types/index';

export type LayoutExpansion = {
    left: boolean;
    right: boolean;
    bottom: boolean;
};

export type ViewportWidthMode = 'auto' | '1x' | '2x' | '3x' | '4x' | '5x';

export interface LayoutState {
    expansion: LayoutExpansion;
    overlayView: string | null;
    viewportWidthMode: ViewportWidthMode;
}

export interface UiStateContextValue {
  state: UiState;
  dispatch: (payload: { type: string; [key: string]: unknown }) => void;
}

export class UiState {
    private state: {
        containers: PanelContainer[];
        panels: Panel[];
        views: View[];
        activeView: string | null;
        dock: any; // Replace with a specific type if available
        theme: any; // Replace with a specific type if available
        layout: LayoutState;
    } = {
        containers: [],
        panels: [],
        views: [],
        activeView: null,
        dock: {},
        theme: {},
        layout: {
            expansion: { left: false, right: false, bottom: false },
            overlayView: null,
            viewportWidthMode: 'auto',
        },
    };

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

    getContainer(containerId: string): PanelContainer | undefined {
        return this.state.containers.find(c => c.id === containerId);
    }

    findContainerByPanel(panelId: string): PanelContainer | undefined {
        return this.state.containers.find(c => c.panels.some(p => p.id === panelId));
    }

    findPanel(panelId: string): Panel | undefined {
        return this.state.panels.find(p => p.id === panelId);
    }

    update(): void {
        // Implement the update logic here.
        // This could involve re-rendering the UI, for example.
    }
}

export const uiState = new UiState();
