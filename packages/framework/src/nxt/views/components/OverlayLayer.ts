import { LitElement, html, css, nothing } from 'lit';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import type { UIState } from '../../../types/state';
import type { ViewInstanceDto } from '../../definitions/dto/view-instance.dto';
import '../host/view-host.js';

export class OverlayLayer extends LitElement {
    static styles = css`
        :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 200;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 0;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .backdrop {
            position: absolute;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.9);
            backdrop-filter: grayscale(100%) blur(1px);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        :host([open]) .backdrop {
            opacity: 1;
        }

        .panel-container {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            background-color: #111827;
            border: 1px solid #374151;
            border-top: none;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            overflow: auto;
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
        }

        :host([open]) .panel-container {
            transform: translateY(0);
            opacity: 1;
        }

        .close-button {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 10;
            background: rgba(0, 0, 0, 0.3);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #e5e7eb;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .close-button:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    `;

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    private close() {
        this.core?.dispatch({ action: 'layout/setOverlayView', payload: { viewId: null } });
    }

    private handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.overlayViewId) {
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

    private get overlayViewId(): string | null {
        return this.core?.getState()?.layout?.overlayView ?? null;
    }

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
        const overlayViewId = this.overlayViewId;
        const isOpen = Boolean(overlayViewId);
        if (isOpen) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }

        const instance = this.buildInstance(overlayViewId);
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
