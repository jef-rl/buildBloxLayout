// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import type { UiStateContextValue } from '../../state/ui-state';
import { createSizeControlsHandlers } from '../../handlers/layout/size-controls.handlers';

export class SizeControls extends LitElement {
    @property({ attribute: false }) viewportWidthMode = '1x'; // Default to '1x'
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
        return this.uiState?.layout?.viewportWidthMode ?? this.viewportWidthMode ?? '1x';
    }

    render() {
        const isColumn = this.orientation === 'column';
        const panels = Array.isArray(this.uiState?.panels) ? this.uiState?.panels : [];
        const mainPanelCount = panels.filter((panel) => panel.region === 'main').length;
        const activeViewCount = this.uiState?.layout?.mainAreaCount ?? 1;

        return html`
            <div class="controls ${isColumn ? 'column' : ''}" @click=${this.handlers.stopClickPropagation}>
                ${['1x', '2x', '3x', '4x', '5x'].map(mode => {
                    const requiredCount = Number.parseInt(mode, 10);
                    const isEnabled = mainPanelCount >= Math.max(requiredCount, 1);
                    
                    const handleViewportClick = () => {
                        if (!isEnabled) return;

                        let targetMode = mode;
                        const requestedCount = Number.parseInt(mode, 10);
                        if (requestedCount > activeViewCount) {
                            targetMode = `${activeViewCount}x`;
                        }
                        this.handlers.setViewport(targetMode);
                    };

                    return html`
                        <button 
                            @click=${handleViewportClick}
                            class="viewport-button ${this.activeViewportWidthMode === mode ? 'active' : ''}"
                            title="${`${mode} Viewport Width`}"
                            ?disabled="${!isEnabled}"
                        >
                            ${mode}
                        </button>
                    `;
                })}
            </div>
        `;
    }
}
customElements.define('size-controls', SizeControls);
