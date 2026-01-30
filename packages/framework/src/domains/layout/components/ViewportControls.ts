import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createControlToolbarHandlers } from '../handlers/control-toolbar.handlers';

type ViewportContext = {
    modes?: string[];
};

export class ViewportControls extends LitElement {
    @property({ type: Object }) context: ViewportContext = {};

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

    private handlers = createControlToolbarHandlers(this, () => this.uiDispatch);

    static styles = css`
        :host {
            display: block;
        }

        .controls {
            display: inline-flex;
            align-items: center;
            gap: 4px;
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

        .viewport-button:hover {
            color: #ffffff;
            background-color: #374151;
        }

        .viewport-button.active {
            background-color: #2563eb;
            color: #ffffff;
        }

        .viewport-button.disabled {
            color: #4b5563;
            cursor: not-allowed;
            opacity: 0.6;
        }
    `;

    private setViewportWidth(requestedMode: string) {
        const mainAreaCount = this.uiState?.layout?.mainAreaCount ?? 1;
        const requestedCount = Number.parseInt(requestedMode, 10);
        const actualMode = requestedCount > mainAreaCount ? `${mainAreaCount}x` : requestedMode;
        this.handlers.setViewportWidthMode(actualMode);
    }

    private resolveVisibleModes() {
        const layout = this.uiState?.layout;
        const panels = this.uiState?.panels ?? [];
        const assignedViews = panels
            .filter((panel) => panel.region === 'main')
            .map((panel) => panel.viewId ?? panel.activeViewId ?? panel.view?.component)
            .filter(Boolean);
        const registeredViewCount = new Set(assignedViews).size;
        const availableViewCount = Math.max(registeredViewCount, layout?.mainAreaCount ?? 1);

        const allModes = this.context?.modes ?? ['1x', '2x', '3x', '4x', '5x'];
        return allModes.slice(0, Math.min(availableViewCount, 5));
    }

    render() {
        const activeViewportWidthMode = this.uiState?.layout?.viewportWidthMode ?? '1x';
        const visibleModes = this.resolveVisibleModes();

        return html`
            <div class="controls" @click=${this.handlers.stopClickPropagation}>
                ${visibleModes.map((mode) => html`
                    <button
                        @click=${() => this.setViewportWidth(mode)}
                        class="viewport-button ${activeViewportWidthMode === mode ? 'active' : ''}"
                        title="${mode} Viewport Width"
                    >
                        ${mode}
                    </button>
                `)}
            </div>
        `;
    }
}

customElements.define('viewport-controls', ViewportControls);
