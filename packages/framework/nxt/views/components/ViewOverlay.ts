import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import type { UIState } from '../../../src/types/state';
import type { Panel } from '../../../src/domains/panels/types';
import { viewOverlayStyles } from './ViewOverlay.styles';

type LegacyPanelView = { component?: string; viewType?: string; id?: string } | null;

export class ViewOverlay extends LitElement {
    static styles = [viewOverlayStyles];
    @property({ type: String }) panelId: string | null = null;

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    @state() private isDropReady = false;

    private get isDesignActive(): boolean {
        const state = this.core?.getState();
        return Boolean(state?.layout?.inDesign && state?.auth?.isAdmin);
    }

    private resolvePanel(): Panel | null {
        if (!this.panelId) {
            return null;
        }
        const panels = this.core?.getState()?.panels ?? [];
        return panels.find((panel) => panel.id === this.panelId) ?? null;
    }

    private resolvePanelViewId(panel: Panel | null): string | null {
        const legacyView = panel?.view as LegacyPanelView;
        return (
            panel?.activeViewId ??
            panel?.viewId ??
            legacyView?.component ??
            legacyView?.viewType ??
            legacyView?.id ??
            null
        );
    }

    private handleDragStart(event: DragEvent) {
        console.log('dragstart');
        if (!this.isDesignActive) {
            return;
        }
        const panel = this.resolvePanel();
        const draggableId = this.resolvePanelViewId(panel);
        if (!draggableId || !event.dataTransfer) {
            return;
        }

        event.dataTransfer.setData('application/x-view-id', draggableId);
        event.dataTransfer.setData('text/plain', draggableId);
        event.dataTransfer.effectAllowed = 'move';
        this.core?.dispatch({
            action: ActionCatalog.LayoutDragStart,
            payload: { viewId: draggableId },
        });
    }

    private handleDragEnd() {
        if (!this.isDesignActive) {
            return;
        }
        this.isDropReady = false;
        this.core?.dispatch({ action: ActionCatalog.LayoutDragEnd, payload: {} });
    }

    private handleDragEnter(event: DragEvent) {
        if (!this.isDesignActive) {
            return;
        }
        event.preventDefault();
        this.isDropReady = true;
    }

    private handleDragOver(event: DragEvent) {
        if (!this.isDesignActive) {
            return;
        }
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        this.isDropReady = true;
    }

    private handleDragLeave() {
        if (!this.isDesignActive) {
            return;
        }
        this.isDropReady = false;
    }

    private handleDrop(event: DragEvent) {
        if (!this.isDesignActive) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.isDropReady = false;

        const viewId =
            event.dataTransfer?.getData('application/x-view-id') ||
            event.dataTransfer?.getData('text/plain');
        if (!viewId || !this.panelId) {
            return;
        }

        this.core?.dispatch({
            action: ActionCatalog.PanelsAssignView,
            payload: { viewId, panelId: this.panelId, swap: event.ctrlKey },
        });
    }

    private handleRemove(event: MouseEvent) {
        event.stopPropagation();
        if (!this.panelId) {
            return;
        }
        const panel = this.resolvePanel();
        const viewId = this.resolvePanelViewId(panel);
        this.core?.dispatch({
            action: ActionCatalog.PanelsRemoveView,
            payload: { panelId: this.panelId, viewId },
        });
    }

    render() {
        const panel = this.resolvePanel();
        const viewId = this.resolvePanelViewId(panel);
        const isActive = this.isDesignActive;
        if (isActive) {
            this.setAttribute('active', '');
        } else {
            this.removeAttribute('active');
        }

        const overlayClasses = [
            'design-overlay',
            isActive ? 'active' : '',
            this.isDropReady ? 'ready' : '',
        ].filter(Boolean).join(' ');

        return html`
            <div
                class=${overlayClasses}
                draggable=${isActive && Boolean(viewId)}
                @dragstart=${this.handleDragStart}
                @dragend=${this.handleDragEnd}
                @dragenter=${this.handleDragEnter}
                @dragover=${this.handleDragOver}
                @dragleave=${this.handleDragLeave}
                @drop=${this.handleDrop}
            >
                ${isActive && viewId
                    ? html`<button class="remove-button" @click=${this.handleRemove} title="Remove view">×</button>`
                    : nothing}
            </div>
        `;
    }
}

customElements.define('view-overlay', ViewOverlay);
