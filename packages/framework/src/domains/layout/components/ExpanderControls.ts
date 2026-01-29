import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createControlToolbarHandlers } from '../handlers/control-toolbar.handlers';
import { isExpanderButtonVisible, isExpanderPanelOpen } from '../../../utils/expansion-helpers';
import type { ExpanderState } from '../../../utils/expansion-helpers';

type ExpanderContext = {
    expanders?: Array<'left' | 'right' | 'bottom'>;
};

export class ExpanderControls extends LitElement {
    @property({ type: Object }) context: ExpanderContext = {};
    @property({ state: true }) private activeControl: 'left' | 'right' | 'bottom' | null = null;

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
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .icon-button {
            padding: 6px;
            border-radius: 6px;
            border: none;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .icon-button:hover {
            color: #ffffff;
            background-color: #374151;
        }

        .icon-button.active {
            color: #60a5fa;
            background-color: rgba(17, 24, 39, 0.5);
        }

        .icon {
            width: 20px;
            height: 20px;
        }

        .control-panel {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            background-color: #2d3748;
            border-radius: 6px;
            padding: 4px;
            z-index: 10;
            gap: 4px;
        }
    `;

    private toggleControlPanel(side: 'left' | 'right' | 'bottom' | null) {
        this.activeControl = this.activeControl === side ? null : side;
    }

    private handleStateSelection(side: 'left' | 'right' | 'bottom', state: ExpanderState) {
        this.handlers.setExpansion(side, state);
        this.activeControl = null;
    }

    private renderControlPanel(side: 'left' | 'right' | 'bottom') {
        const states: ExpanderState[] = ['Collapsed', 'Closed', 'Opened', 'Expanded'];
        return html`
            <div class="control-panel">
                ${states.map((state) => html`
                    <button class="icon-button" @click=${() => this.handleStateSelection(side, state)} title=${state}>
                        ${this.renderStateIcon(state, side)}
                    </button>
                `)}
            </div>
        `;
    }

    private renderStateIcon(state: ExpanderState, side: 'left' | 'right' | 'bottom') {
        const baseUrl = 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons';
        let stateSegment = state.toLowerCase();
        if (state === 'Collapsed') stateSegment = 'hidden';
        if (state === 'Opened') stateSegment = 'open';

        const filename = `expander-${side}-${stateSegment}-48.png`;
        const iconUrl = `${baseUrl}/${filename}`;

        return html`
            <img class="icon" src="${iconUrl}" alt="${side} ${state}" />
        `;
    }

    private resolveVisibleExpanders() {
        const configured = this.context?.expanders;
        const defaultExpanders: Array<'left' | 'right' | 'bottom'> = ['left', 'bottom', 'right'];
        return Array.isArray(configured) && configured.length > 0 ? configured : defaultExpanders;
    }

    render() {
        const expansion = this.uiState?.layout?.expansion ?? {
            expanderLeft: 'Closed',
            expanderRight: 'Closed',
            expanderBottom: 'Closed',
        };

        const visibleExpanders = this.resolveVisibleExpanders();
        const leftVisible = visibleExpanders.includes('left') && isExpanderButtonVisible(expansion.expanderLeft);
        const rightVisible = visibleExpanders.includes('right') && isExpanderButtonVisible(expansion.expanderRight);
        const bottomVisible = visibleExpanders.includes('bottom') && isExpanderButtonVisible(expansion.expanderBottom);

        const leftExpanded = isExpanderPanelOpen(expansion.expanderLeft);
        const rightExpanded = isExpanderPanelOpen(expansion.expanderRight);
        const bottomExpanded = isExpanderPanelOpen(expansion.expanderBottom);

        return html`
            <div class="controls" @click=${this.handlers.stopClickPropagation}>
                ${leftVisible ? html`
                    <div style="position: relative;">
                        <button class="icon-button ${leftExpanded ? 'active' : ''}" @click=${() => this.toggleControlPanel('left')} title="Toggle Left Panel">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                               <rect x="3" y="3" width="5" height="18" fill="#0284c7" stroke="none" />
                               ${leftExpanded
        ? html`<path d="M12 12l-3 0m0 0l1.5 -1.5m-1.5 1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
        : html`<path d="M10 12l3 0m0 0l-1.5 -1.5m1.5 1.5l-1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
    }
                            </svg>
                        </button>
                        ${this.activeControl === 'left' ? this.renderControlPanel('left') : nothing}
                    </div>
                ` : nothing}
                ${bottomVisible ? html`
                    <div style="position: relative;">
                        <button class="icon-button ${bottomExpanded ? 'active' : ''}" @click=${() => this.toggleControlPanel('bottom')} title="Toggle Bottom Panel">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                               <rect x="3" y="18" width="18" height="3" fill="#0284c7" stroke="none" />
                               ${bottomExpanded
        ? html`<path d="M12 12l0 3m0 0l-1.5 -1.5m1.5 1.5l1.5 -1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
        : html`<path d="M12 15l0 -3m0 0l-1.5 1.5m1.5 -1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
    }
                            </svg>
                        </button>
                        ${this.activeControl === 'bottom' ? this.renderControlPanel('bottom') : nothing}
                    </div>
                ` : nothing}
                ${rightVisible ? html`
                    <div style="position: relative;">
                        <button class="icon-button ${rightExpanded ? 'active' : ''}" @click=${() => this.toggleControlPanel('right')} title="Toggle Right Panel">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                               <rect x="16" y="3" width="5" height="18" fill="#0284c7" stroke="none" />
                               ${rightExpanded
        ? html`<path d="M12 12l3 0m0 0l-1.5 -1.5m1.5 1.5l-1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
        : html`<path d="M14 12l-3 0m0 0l1.5 -1.5m-1.5 1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
    }
                            </svg>
                        </button>
                        ${this.activeControl === 'right' ? this.renderControlPanel('right') : nothing}
                    </div>
                ` : nothing}
            </div>
        `;
    }
}

customElements.define('expander-controls', ExpanderControls);
