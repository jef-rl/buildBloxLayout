
import type {
    LayoutState,
    Panel,
    PanelContainer,
    UIState,
    View,
} from '../types/index';

export type { LayoutExpansion, LayoutState, MainAreaPanelCount, ToolbarState, UIState } from '../types/ui-state';
export type { ViewportWidthMode } from '../types/core';

export type UiStateContextState = UIState;

export interface UiStateContextValue {
  state: UiStateContextState;
  dispatch: (payload: { type: string; [key: string]: unknown }) => void;
}

export class UiState {
    private state: UIState = {
        containers: [],
        panels: [],
        views: [],
        viewTokens: {
            registered: [],
            activeSlots: [null, null, null, null, null],
            tokenOrder: [],
        },
        activeView: null,
        layout: {
            expansion: { left: false, right: false, bottom: false },
            overlayView: null,
            viewportWidthMode: 'auto',
            mainAreaCount: 1,
            mainViewOrder: [],
        },
        toolbars: {
            positions: {},
            activePicker: null,
        },
        dock: {},
        theme: {},
        auth: {
            isLoggedIn: false,
            user: null,
        },
        panelState: {
            open: {},
            data: {},
            errors: {},
        },
    };
    private listeners = new Set<(state: UIState) => void>();

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
        this.listeners.forEach((listener) => listener(this.state));
    }

    hydrate(patch: Partial<UIState>): UIState {
        this.state = {
            ...this.state,
            ...patch,
        };
        this.listeners.forEach((listener) => listener(this.state));
        return this.state;
    }

    subscribe(listener: (state: UIState) => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}

export const uiState = new UiState();
