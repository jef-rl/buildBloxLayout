import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { ViewInstanceDto } from '../../definitions/dto/view-instance.dto';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import type { UIState } from '../../../types/state';
import type { ViewInstanceResolver } from '../../selectors/view-instances/resolve-view-instance.selector';
import { viewInstanceResolverSelectorKey } from '../../selectors/view-instances/resolve-view-instance.selector';
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

    private resolveInstance(): ViewInstanceDto | null {
        if (this.instance) {
            return this.instance;
        }

        const resolver = this.core?.select<ViewInstanceResolver>(viewInstanceResolverSelectorKey);
        if (!resolver) {
            return null;
        }

        return resolver(this.viewId);
    }

    render() {
        const resolvedInstance = this.resolveInstance();
        const instances = resolvedInstance ? [resolvedInstance] : [];
        return html`
            <view-host .instances=${instances}></view-host>
        `;
    }
}

customElements.define('panel-view', PanelView);
