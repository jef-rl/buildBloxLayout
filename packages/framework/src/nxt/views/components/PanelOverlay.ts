import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import type { UIState } from '../../../types/state';
import type { Panel } from '../../../domains/panels/types';

type LegacyPanelView = { component?: string; viewType?: string; id?: string } | null;

export class PanelOverlay extends LitElement {
    static styles = css`
        :host {
            position: absolute;
            inset: 0;
            display: block;
            z-index: 10;
        }

        :host([active]) {
            pointer-events: all;
        }

        .design-overlay {
            position: absolute;
            inset: 0;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
            border: 1px dashed rgba(148, 163, 184, 0.35);
            background: rgba(148, 163, 184, 0.35);
            opacity: 0;
            transition: opacity 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
        }

        .design-overlay.active {
            opacity: 1;
        }

        .design-overlay.ready {
            border-color: rgba(59, 130, 246, 0.9);
            background: rgba(59, 130, 246, 0.08);
        }

        .remove-button {
            position: absolute;
            top: 8px;
            right: 8px;
            border: none;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.9);
            color: #e2e8f0;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .remove-button:hover {
            background: rgba(239, 68, 68, 0.9);
        }
    `;

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

customElements.define('panel-overlay', PanelOverlay);
