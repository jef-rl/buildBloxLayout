import { getPosClasses } from '../../utils/helpers';

export type DockPosition =
    'top-center' | 'top-right' | 'middle-right' | 'bottom-right' |
    'bottom-center' | 'bottom-left' | 'middle-left' | 'top-left';

export type DockManagerState = {
    positions: Record<string, DockPosition>;
    activePicker: string | null;
};

export class DockManager extends EventTarget {
    private state: DockManagerState;
    private defaultPosition: DockPosition;

    constructor(initialPositions: Record<string, DockPosition> = {}, defaultPosition: DockPosition = 'bottom-center') {
        super();
        this.defaultPosition = defaultPosition;
        this.state = { positions: { ...initialPositions }, activePicker: null };
    }

    getState(): DockManagerState {
        return {
            positions: { ...this.state.positions },
            activePicker: this.state.activePicker
        };
    }

    getPosition(toolbarId: string, fallback: DockPosition = this.defaultPosition): DockPosition {
        return this.state.positions[toolbarId] || fallback;
    }

    getLayout(toolbarId: string, fallback: DockPosition = this.defaultPosition) {
        const position = this.getPosition(toolbarId, fallback);
        return { position, ...getPosClasses(position) };
    }

    getOccupiedPositions(excludeId?: string): DockPosition[] {
        return Object.entries(this.state.positions)
            .filter(([key]) => key !== excludeId)
            .map(([, pos]) => pos);
    }

    isPickerOpen(toolbarId: string) {
        return this.state.activePicker === toolbarId;
    }

    togglePicker(toolbarId: string) {
        const next = this.isPickerOpen(toolbarId) ? null : toolbarId;
        this.updateState({ activePicker: next });
    }

    closePicker() {
        if (this.state.activePicker) {
            this.updateState({ activePicker: null });
        }
    }

    setPosition(toolbarId: string, position: DockPosition) {
        const positions = { ...this.state.positions, [toolbarId]: position };
        this.updateState({ positions, activePicker: null });
    }

    private updateState(partial: Partial<DockManagerState>) {
        this.state = { ...this.state, ...partial };
        this.dispatchEvent(new CustomEvent('change', { detail: this.getState() }));
    }
}
