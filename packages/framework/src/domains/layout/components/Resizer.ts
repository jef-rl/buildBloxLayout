// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createSizeControlsHandlers } from '../handlers/size-controls.handlers';

export class SizeControls extends LitElement {
    @property({ attribute: false }) viewportWidthMode = 'auto'; // 'auto', '1x', etc
    @property({ type: String }) orientation = 'row';

    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;
    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? null;
            this.uiDispatch = value?.dispatch ?? null;
            this.requestUpdate();
        },
    });
    private handlers = createSizeControlsHandlers(this, () => this.uiDispatch);

    static styles = css`
        :host {
            display: block;
        }

        .controls {
            display: flex;
            gap: 4px;
        }

        .controls.column {
            flex-direction: column;
        }

        .viewport-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 24px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #9ca3af;
            background: transparent;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

      

        .viewport-button.active {
            background-color: #2563eb;
            color: #ffffff;
        }

        .viewport-button:disabled {
            color: #4b5563;
            cursor: not-allowed;
            opacity: 0.6;
        }

        .icon {
            width: 14px;
            height: 14px;
        }
    `;

    get activeViewportWidthMode() {
        return this.uiState?.layout?.viewportWidthMode ?? this.viewportWidthMode ?? 'auto';
    }

    render() {
        const isColumn = this.orientation === 'column';
        const panels = Array.isArray(this.uiState?.panels) ? this.uiState?.panels : [];
        const mainPanelCount = panels.filter((panel) => panel.region === 'main').length;

        return html`
            <div class="controls ${isColumn ? 'column' : ''}" @click=${this.handlers.stopClickPropagation}>
                ${['1x', '2x', '3x', '4x', '5x', 'auto'].map(mode => {
                    const requiredCount = mode === 'auto' ? 0 : Number.parseInt(mode, 10);
                    const isEnabled = mode === 'auto' || mainPanelCount >= Math.max(requiredCount, 1);

                    return html`
                        <button 
                            @click=${() => isEnabled && this.handlers.setViewport(mode)}
                            class="viewport-button ${this.activeViewportWidthMode === mode ? 'active' : ''}"
                            title="${mode === 'auto' ? 'Auto Width (Magic)' : `${mode} Viewport Width`}"
                            ?disabled="${!isEnabled}"
                        >
                            ${mode === 'auto'
                                ? html`<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`
                                : mode}
                        </button>
                    `;
                })}
            </div>
        `;
    }
}
customElements.define('size-controls', SizeControls);
