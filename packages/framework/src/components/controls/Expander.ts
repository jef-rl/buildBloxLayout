// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../state/context';
import type { UiStateContextValue } from '../../state/ui-state';

export class ExpanderControls extends LitElement {
    @property({ type: String }) orientation = 'row';

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
        const expanded = this.uiState?.layout?.expansion?.[side];
        this.uiDispatch?.({ type: 'layout/setExpansion', side, expanded: !expanded });
    }

    toggleOverlay() {
        const currentOverlay = this.uiState?.layout?.overlayView;
        const nextOverlay = currentOverlay ? null : 'settings';
        this.uiDispatch?.({ type: 'layout/setOverlayView', viewId: nextOverlay });
    }

    render() {
        const isColumn = this.orientation === 'column';
        const leftExpanded = this.uiState?.layout?.expansion?.left;
        const rightExpanded = this.uiState?.layout?.expansion?.right;
        const bottomExpanded = this.uiState?.layout?.expansion?.bottom;
        const overlayOpen = !!this.uiState?.layout?.overlayView;
        const separatorClass = `separator ${isColumn ? 'column' : 'row'}`;

        return html`
            <div class="controls ${isColumn ? 'column' : ''}">
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
