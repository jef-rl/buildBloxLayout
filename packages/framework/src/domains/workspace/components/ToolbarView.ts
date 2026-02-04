import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { ViewInstanceDto } from '../../../nxt/definitions/dto/view-instance.dto';
import type { CoreContext } from '../../../nxt/runtime/context/core-context';
import { coreContext } from '../../../nxt/runtime/context/core-context-key';
import type { UIState } from '../../../types/state';
import '../../../nxt/views/host/view-host.js';

export class ToolbarView extends LitElement {
    @property({ type: String }) panelId: string | null = null;
    @property({ type: String }) viewId: string | null = null;
    @property({ type: String }) viewInstanceId: string | null = null;

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
            position: relative;
        }

        .view-wrapper {
            position: relative;
            height: 100%;
            width: 100%;
        }

        .view-container {
            height: 100%;
            width: 100%;
            position: relative;
            z-index: 1;
        }

        .fallback {
            display: grid;
            place-items: center;
            height: 100%;
            color: #9ca3af;
            font-size: 0.9rem;
            position: absolute;
            inset: 0;
            z-index: 0;
        }
    `;

    private buildInstance(viewId: string | null): ViewInstanceDto | null {
        if (!viewId) {
            return null;
        }

        const state = this.core?.getState();
        const instance = state?.viewInstances?.[viewId];
        if (instance) {
            return {
                instanceId: instance.instanceId,
                viewId: instance.definitionId,
                settings: instance.localContext,
            };
        }

        const legacyView = state?.views?.find((view) => view.id === viewId);
        if (legacyView) {
            return {
                instanceId: legacyView.id,
                viewId: legacyView.component,
                settings: (legacyView.data as Record<string, unknown>) ?? {},
            };
        }

        return { instanceId: viewId, viewId };
    }

    render() {
        const instance = this.buildInstance(this.viewId);
        const instances = instance ? [instance] : [];
        return html`
            <div class="view-wrapper">
                <div class="view-container">
                    <view-host .instances=${instances}></view-host>
                </div>
            </div>
        `;
    }
}

customElements.define('embed-view', ToolbarView);
