import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { ViewInstanceDto } from '../../definitions/dto/view-instance.dto';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import type { UIState } from '../../../types/state';
import '../host/view-host.js';

export class PanelView extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }
    `;

    @property({ attribute: false }) instance?: ViewInstanceDto;
    @property({ type: String }) viewId: string | null = null;

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    private buildInstance(): ViewInstanceDto | null {
        if (this.instance) {
            return this.instance;
        }

        if (!this.viewId) {
            return null;
        }

        const state = this.core?.getState();
        const instance = state?.viewInstances?.[this.viewId];
        if (instance) {
            return {
                instanceId: instance.instanceId,
                viewId: instance.definitionId,
                settings: instance.localContext,
            };
        }

        const legacyView = state?.views?.find((view) => view.id === this.viewId);
        if (legacyView) {
            return {
                instanceId: legacyView.id,
                viewId: legacyView.component,
                settings: (legacyView.data as Record<string, unknown>) ?? {},
            };
        }

        return { instanceId: this.viewId, viewId: this.viewId };
    }

    render() {
        const resolvedInstance = this.buildInstance();
        const instances = resolvedInstance ? [resolvedInstance] : [];
        return html`
            <view-host .instances=${instances}></view-host>
        `;
    }
}

customElements.define('panel-view', PanelView);
