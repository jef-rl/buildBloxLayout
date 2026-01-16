// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import type { UiStateContextValue } from '../../state/ui-state';
import './PanelView';

export class OverlayExpander extends LitElement {
    @property({ type: String }) viewId: string | null = null;

    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;

    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? this.uiState;
            this.uiDispatch = value?.dispatch ?? this.uiDispatch;
            this.requestUpdate();
        },
    });

    static styles = css`
        :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 200; /* High z-index to cover everything */
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 0; /* Changed from 10vh to 0 to align to top */
        }

        :host([open]) {
            pointer-events: auto;
        }

        .backdrop {
            position: absolute;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.9); /* Darker overlay */
            backdrop-filter: grayscale(100%) blur(1px); /* Changed blur to less and added grayscale */
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        :host([open]) .backdrop {
            opacity: 1;
        }

        .panel-container {
            position: relative;
            width: 80vw;
            height: 80vh;
            background-color: #111827;
            border: 1px solid #374151;
            border-top: none; /* Looks attached to top if no top border */
            border-radius: 0 0 12px 12px; /* Rounded only at bottom */
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            transform: translateY(-100%); /* Slide down from top */
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

    close() {
        this.uiDispatch?.({ type: 'layout/setOverlayView', viewId: null });
    }

    render() {
        const isOpen = !!this.viewId;
        if (isOpen) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }

        return html`
            <div class="backdrop" @click=${this.close}></div>
            <div class="panel-container">
                <button class="close-button" @click=${this.close}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
                ${isOpen ? html`
                    <panel-view .viewId="${this.viewId}">
                        <!-- Fallback content if view not found or just container -->
                    </panel-view>
                ` : nothing}
            </div>
        `;
    }
}
customElements.define('overlay-expander', OverlayExpander);
