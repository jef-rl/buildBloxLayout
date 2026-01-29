// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createExpanderControlsHandlers } from '../handlers/expander-controls.handlers';
import { toggleExpanderState, isExpanderButtonVisible, isExpanderPanelOpen } from '../../../utils/expansion-helpers.js';
import type { LayoutExpansion } from '../../../types/state.js';

export class ExpanderControls extends LitElement {
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
    private handlers = createExpanderControlsHandlers(this, () => this.uiDispatch);

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
            border-radius: 999px; /* Pill/Circle shape to match other toolbars if desired, or 6px for square */
            border: none;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
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
    `;

    toggleSide(side: 'left' | 'right' | 'bottom') {
        const key = `expander${side.charAt(0).toUpperCase()}${side.slice(1)}` as keyof LayoutExpansion;
        const currentState = this.uiState?.layout?.expansion?.[key] ?? 'Closed';
        const newState = toggleExpanderState(currentState);
        // Dispatch with boolean for backward compatibility
        this.handlers.setExpansion(side, newState === 'Opened');
    }

    toggleOverlay() {
        const currentOverlay = this.uiState?.layout?.overlayView;
        const nextOverlay = currentOverlay ? null : 'settings';
        this.handlers.setOverlayView(nextOverlay);
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

        const leftExpanderButton = leftVisible ? html`
                    <button class="icon-button ${leftExpanded ? 'active' : ''}" @click=${() => this.toggleSide('left')} title="Toggle Left Panel">
                    <!-- Left Sidebar Icon (Left Block) -->
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                       <rect x="3" y="3" width="5" height="18" fill="#0284c7" stroke="none" />
                       ${leftExpanded 
                         ? html`<path d="M12 12l-3 0m0 0l1.5 -1.5m-1.5 1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` // Arrow Left
                         : html`<path d="M10 12l3 0m0 0l-1.5 -1.5m1.5 1.5l-1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` // Arrow Right
                       }
                    </svg>
                    </button>
                ` : nothing;

        const bottomExpanderButton = bottomVisible ? html`
                    <button class="icon-button ${bottomExpanded ? 'active' : ''}" @click=${() => this.toggleSide('bottom')} title="Toggle Bottom Panel">
                        <!-- Bottom Panel Icon (Bottom Block) -->
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                           <rect x="3" y="18" width="18" height="3" fill="#0284c7" stroke="none" />
                           ${bottomExpanded
                             ? html`<path d="M12 12l0 3m0 0l-1.5 -1.5m1.5 1.5l1.5 -1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` // Arrow Down
                             : html`<path d="M12 15l0 -3m0 0l-1.5 1.5m1.5 -1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` // Arrow Up
                           }
                        </svg>
                    </button>
                ` : nothing;

        const rightExpanderButton = rightVisible ? html`
                    <button class="icon-button ${rightExpanded ? 'active' : ''}" @click=${() => this.toggleSide('right')} title="Toggle Right Panel">
                        <!-- Right Sidebar Icon (Right Block) -->
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <rect x="3" y="3" width="18" height="18" fill="#cbd5e1" stroke="none" />
                           <rect x="16" y="3" width="5" height="18" fill="#0284c7" stroke="none" />
                           ${rightExpanded
                             ? html`<path d="M12 12l3 0m0 0l-1.5 -1.5m1.5 1.5l-1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` // Arrow Right
                             : html`<path d="M14 12l-3 0m0 0l1.5 -1.5m-1.5 1.5l1.5 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` // Arrow Left
                           }
                        </svg>
                    </button>
                ` : nothing;

        // If left panel is expanded, we want the bottom button to appear AFTER the right button or at the end
        // If left panel is closed, we want the bottom button to appear next to the left button (current behavior)
        // However, the request says "move to the right if the left expander is open".
        // Assuming the order is usually [Left, Bottom, Right, Separator, Overlay]
        // If Left is Open, we want [Left, Right, Bottom, Separator, Overlay] ? 
        // Or maybe just swap Bottom and Right? Or move Bottom further right?
        
        // Let's implement dynamic ordering based on `leftExpanded`.
        
        let buttons;
        if (leftExpanded) {
             // Move bottom button to the right of other controls or swap?
             // Based on the request "move to the right", I'll place it after the Right button.
             buttons = html`
                ${leftExpanderButton}
                ${rightExpanderButton}
                ${bottomExpanderButton}
             `;
        } else {
            // Default order
             buttons = html`
                ${leftExpanderButton}
                ${bottomExpanderButton}
                ${rightExpanderButton}
             `;
        }


        return html`
            <div class="controls ${isColumn ? 'column' : ''}">
                ${buttons}
                <div class="${separatorClass}"></div>
                <button class="icon-button ${overlayOpen ? 'active' : ''}" @click=${() => this.toggleOverlay()} title="Toggle Overlay (Test)">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>
        `;
    }
}
customElements.define('expander-controls', ExpanderControls);
