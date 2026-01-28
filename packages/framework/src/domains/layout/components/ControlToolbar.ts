// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createControlToolbarHandlers } from '../handlers/control-toolbar.handlers';
import { toggleExpanderState, isExpanderButtonVisible, isExpanderPanelOpen, ExpanderState } from '../../../utils/expansion-helpers.js';
import type { LayoutExpansion } from '../../../types/state.js';

export class ControlToolbar extends LitElement {
    @property({ type: String }) orientation = 'row';
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

        .controls.column {
            flex-direction: column;
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

        .viewport-icon {
            width: 14px;
            height: 14px;
        }

        .separator {
            background-color: #374151;
        }

        .separator.row {
            width: 1px;
            height: 16px;
            margin: 0 4px;
        }

        .separator.column {
            width: 16px;
            height: 1px;
            margin: 4px 0;
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
        if (this.activeControl === side) {
            this.activeControl = null;
        } else {
            this.activeControl = side;
        }
    }

    private handleStateSelection(side: 'left' | 'right' | 'bottom', state: ExpanderState) {
        this.handlers.setExpansion(side, state);
        this.activeControl = null;
    }

    toggleOverlay() {
        const currentOverlay = this.uiState?.layout?.overlayView;
        const nextOverlay = currentOverlay ? null : 'settings';
        this.handlers.setOverlayView(nextOverlay);
    }

    setViewportWidth(requestedMode: string) {
        // Rule #1: Proactive Width Limiting
        // Cap the requested width to the current mainAreaCount
        const mainAreaCount = this.uiState?.layout?.mainAreaCount ?? 1;
        const requestedCount = Number.parseInt(requestedMode, 10);

        // If requested width exceeds active views, cap it
        const actualMode = requestedCount > mainAreaCount
            ? `${mainAreaCount}x`
            : requestedMode;

        this.handlers.setViewport(actualMode);
    }
    
    renderControlPanel(side: 'left' | 'right' | 'bottom') {
        const states: ExpanderState[] = ['Collapsed', 'Closed', 'Opened', 'Expanded'];
        return html`
            <div class="control-panel">
                ${states.map(state => html`
                    <button class="icon-button" @click=${() => this.handleStateSelection(side, state)} title=${state}>
                        ${this.renderStateIcon(state, side)}
                    </button>
                `)}
            </div>
        `;
    }

    renderStateIcon(state: ExpanderState, side: 'left' | 'right' | 'bottom') {
        const baseUrl = 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons';
        
        // Map internal state to filename segments
        // Collapsed -> hidden
        // Closed -> closed
        // Opened -> open
        // Expanded -> expanded
        let stateSegment = state.toLowerCase();
        if (state === 'Collapsed') stateSegment = 'hidden';
        if (state === 'Opened') stateSegment = 'open';

        const filename = `expander-${side}-${stateSegment}-48.png`;
        const iconUrl = `${baseUrl}/${filename}`;

        return html`
            <img class="icon" src="${iconUrl}" alt="${side} ${state}" />
        `;
    }

    render() {
        const isColumn = this.orientation === 'column';
        const expansion = this.uiState?.layout?.expansion ?? {
            expanderLeft: 'Closed',
            expanderRight: 'Closed',
            expanderBottom: 'Closed'
        };

        // Check button visibility using helper
        const leftVisible = isExpanderButtonVisible(expansion.expanderLeft);
        const rightVisible = isExpanderButtonVisible(expansion.expanderRight);
        const bottomVisible = isExpanderButtonVisible(expansion.expanderBottom);

        // Check if panels are open for active state
        const leftExpanded = isExpanderPanelOpen(expansion.expanderLeft);
        const rightExpanded = isExpanderPanelOpen(expansion.expanderRight);
        const bottomExpanded = isExpanderPanelOpen(expansion.expanderBottom);

        const overlayOpen = !!this.uiState?.layout?.overlayView;
        const separatorClass = `separator ${isColumn ? 'column' : 'row'}`;

        // Get viewport info for size controls
        const activeViewportWidthMode = this.uiState?.layout?.viewportWidthMode ?? '1x';

        // === FILTER BUTTONS BASED ON AVAILABLE VIEWS ===
        const panels = this.uiState?.panels ?? [];
        const assignedViews = panels
            .filter(p => p.region === 'main')
            .map(p => p.viewId ?? p.activeViewId ?? p.view?.component)
            .filter(Boolean);
        const registeredViewCount = new Set(assignedViews).size;
        const availableViewCount = Math.max(
            registeredViewCount,
            this.uiState?.layout?.mainAreaCount ?? 1
        );

        const allModes = ['1x', '2x', '3x', '4x', '5x'];
        const visibleModes = allModes.slice(0, Math.min(availableViewCount, 5));
        // === END FILTER CODE ===

        return html`
            <div class="controls ${isColumn ? 'column' : ''}" @click=${this.handlers.stopClickPropagation}>
                <!-- Expander Controls Section -->
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

                <!-- Separator -->
                <div class="${separatorClass}"></div>

                <!-- Size Controls Section -->
                ${visibleModes.map(mode => html`
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
customElements.define('control-toolbar', ControlToolbar);
