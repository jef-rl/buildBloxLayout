import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import type { UIState } from '../../../types/state';
import '../../../domains/workspace/components/ToolbarView.js';

type ToolbarContext = {
    viewIds?: string[];
    gap?: number;
    align?: string;
    justify?: string;
    stretchViewIds?: string[];
};

export class ToolbarContainer extends LitElement {
    @property({ type: String }) instanceId = '';
    @property({ type: Object }) context: ToolbarContext = {};

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .toolbar {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--toolbar-gap, 8px);
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
        }

        .toolbar-item {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 0 0 auto;
        }

        .toolbar-item--stretch {
            flex: 1 1 auto;
            min-width: 0;
        }

        .toolbar-item embed-view {
            width: 100%;
        }

        .toolbar.drag-over {
            outline: 1px dashed rgba(59, 130, 246, 0.8);
            outline-offset: 4px;
            border-radius: 6px;
        }
    `;

    private get viewIds(): string[] {
        const ids = this.context?.viewIds;
        return Array.isArray(ids) ? ids : [];
    }

    private get stretchViewIds(): string[] {
        const ids = this.context?.stretchViewIds;
        return Array.isArray(ids) ? ids : [];
    }

    private updateViewIds(nextOrder: string[]) {
        if (!this.instanceId) {
            return;
        }
        this.core?.dispatch({
            action: 'view/updateLocalContext',
            payload: { instanceId: this.instanceId, context: { viewIds: nextOrder } },
        });
    }

    private handleDragStart(event: DragEvent, viewId: string) {
        if (!event.dataTransfer) {
            return;
        }
        event.dataTransfer.setData('application/x-view-id', viewId);
        event.dataTransfer.setData('text/plain', viewId);
        event.dataTransfer.effectAllowed = 'move';
    }

    private handleDragOver(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
        }
        (event.currentTarget as HTMLElement)?.classList.add('drag-over');
    }

    private handleDragLeave(event: DragEvent) {
        (event.currentTarget as HTMLElement)?.classList.remove('drag-over');
    }

    private handleDrop(event: DragEvent) {
        event.preventDefault();
        (event.currentTarget as HTMLElement)?.classList.remove('drag-over');
        const droppedId =
            event.dataTransfer?.getData('application/x-view-id') ||
            event.dataTransfer?.getData('text/plain');
        if (!droppedId) {
            return;
        }

        const currentOrder = this.viewIds;
        const targetItem = (event.target as HTMLElement)?.closest<HTMLElement>('[data-view-id]');
        const targetId = targetItem?.dataset?.viewId;

        if (targetId === droppedId) {
            return;
        }

        const nextOrder = currentOrder.filter((id) => id !== droppedId);

        if (targetId) {
            const targetIndex = nextOrder.indexOf(targetId);
            if (targetIndex >= 0) {
                nextOrder.splice(targetIndex, 0, droppedId);
            } else {
                nextOrder.push(droppedId);
            }
        } else {
            nextOrder.push(droppedId);
        }

        this.updateViewIds(nextOrder);
    }

    private isStretchItem(viewId: string): boolean {
        if (this.stretchViewIds.includes(viewId)) {
            return true;
        }
        return viewId.includes('token');
    }

    render() {
        const gap = typeof this.context?.gap === 'number' ? this.context.gap : 8;
        const align = this.context?.align ?? 'center';
        const justify = this.context?.justify ?? 'flex-start';

        return html`
            <div
                class="toolbar"
                style="--toolbar-gap: ${gap}px; align-items: ${align}; justify-content: ${justify};"
                @dragover=${this.handleDragOver}
                @dragleave=${this.handleDragLeave}
                @drop=${this.handleDrop}
            >
                ${this.viewIds.map((viewId) => {
                    const stretch = this.isStretchItem(viewId);
                    return html`
                        <div
                            class="toolbar-item ${stretch ? 'toolbar-item--stretch' : ''}"
                            data-view-id=${viewId}
                            draggable="true"
                            @dragstart=${(event: DragEvent) => this.handleDragStart(event, viewId)}
                        >
                            <embed-view .viewId=${viewId}></embed-view>
                        </div>
                    `;
                })}
            </div>
        `;
    }
}

customElements.define('toolbar-container', ToolbarContainer);
