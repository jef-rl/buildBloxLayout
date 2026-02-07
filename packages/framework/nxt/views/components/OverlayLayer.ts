import { LitElement, html, nothing } from 'lit';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import type { UIState } from '../../../src/types/state';
import type { OverlayViewState } from '../../selectors/overlay/overlay-view.selector';
import { overlayViewSelectorKey } from '../../selectors/overlay/overlay-view.selector';
import '../host/view-host.js';
import { overlayLayerStyles } from './OverlayLayer.styles';

export class OverlayLayer extends LitElement {
    static styles = [overlayLayerStyles];

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    private close() {
        this.core?.dispatch({ action: ActionCatalog.LayoutSetOverlayView, payload: { viewId: null } });
    }

    private handleKeydown = (event: KeyboardEvent) => {
        const overlayState = this.getOverlayState();
        if (event.key === 'Escape' && overlayState?.isOpen) {
            this.close();
        }
    };

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', this.handleKeydown);
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this.handleKeydown);
        super.disconnectedCallback();
    }

    private getOverlayState(): OverlayViewState | null {
        return this.core?.select<OverlayViewState>(overlayViewSelectorKey) ?? null;
    }

    render() {
        const overlayState = this.getOverlayState();
        const overlayViewId = overlayState?.overlayViewId ?? null;
        const isOpen = overlayState?.isOpen ?? false;
        if (isOpen) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }

        const instance = overlayState?.instance ?? null;
        const instances = instance ? [instance] : [];

        return html`
            <div class="backdrop" @click=${this.close}></div>
            <div class="panel-container">
                <button class="close-button" @click=${this.close}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
                ${isOpen
                    ? html`<view-host .instances=${instances}></view-host>`
                    : nothing}
            </div>
        `;
    }
}

customElements.define('overlay-expander', OverlayLayer);
