
import type { Panel, PanelContainer, View } from '../types/index';

export interface UiStateContextValue {
  state: UiState;
  dispatch: (type: string, payload: any) => void;
}

export class UiState {
    private state: {
        containers: PanelContainer[];
        panels: Panel[];
        views: View[];
        activeView: string | null;
        dock: any; // Replace with a specific type if available
        theme: any; // Replace with a specific type if available
    } = {
        containers: [],
        panels: [],
        views: [],
        activeView: null,
        dock: {},
        theme: {},
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
