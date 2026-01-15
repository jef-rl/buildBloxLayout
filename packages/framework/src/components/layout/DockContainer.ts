// @ts-nocheck
import { LitElement, html, nothing, css } from 'lit';
import { property } from 'lit/decorators.js';
import { DockManager } from './DockManager';
import { getPosClasses } from '../../utils/helpers';
import './PositionPicker';
import { createDockContainerHandlers } from '../../handlers/layout/dock.handlers';

export class DockContainer extends LitElement {
    @property({ type: Object }) manager: DockManager | null = null;
    @property({ type: String }) toolbarId = '';
    @property({ type: String }) fallbackPosition = 'bottom-center';
    @property({ attribute: false }) layoutConfig: ReturnType<typeof getPosClasses> & { position: string } | null = null;
    
    @property({ type: Boolean }) disablePositionPicker = false;

    handlers = createDockContainerHandlers(this);

    static styles = css`
        :host {
            position: absolute;
            inset: 0;
            z-index: 50;
            pointer-events: none;
        }

        /* Specific overrides for direction controls HOST to lower z-index */
        :host([toolbarId="direction"]),
        :host([toolbarId="directionRight"]) {
            z-index: 40;
        }

        .dock-container {
            position: absolute;
            z-index: 50;
            display: flex;
            align-items: center;
            pointer-events: auto;
            background-color: rgba(17, 24, 39, 0.95);
            border: 1px solid #374151;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
            /* backdrop-filter: blur(8px); -- Removed to prevent trapping fixed position children */
            transition: all 0.3s ease;
        }

        .dock-container--row {
            padding: 6px 16px;
            flex-direction: row;
            gap: 12px;
        }

        .dock-container--column {
            padding: 16px 6px;
            flex-direction: column;
            gap: 12px;
        }

        .dock-container--top-center {
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            border-top: 0;
            border-radius: 0 0 16px 16px;
        }

        .dock-container--bottom-center {
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            border-bottom: 0;
            border-radius: 16px 16px 0 0;
        }

        .dock-container--top-right {
            top: 0;
            right: 0;
            border-top: 0;
            border-right: 0;
            border-radius: 0 0 0 16px;
        }

        .dock-container--middle-right {
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            border-right: 0;
            border-radius: 16px 0 0 16px;
        }

        .dock-container--bottom-right {
            bottom: 0;
            right: 0;
            border-bottom: 0;
            border-right: 0;
            border-radius: 16px 0 0 0;
        }

        .dock-container--bottom-left {
            bottom: 0;
            left: 0;
            border-bottom: 0;
            border-left: 0;
            border-radius: 0 16px 0 0;
        }

        .dock-container--middle-left {
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            border-left: 0;
            border-radius: 0 16px 16px 0;
        }

        /* Specific overrides for direction controls */
        :host([toolbarId="direction"]) .dock-container--bottom-left {
            left: calc((25vw - 48px) / 2);
            padding: 0;
            border-radius: 12px 12px 0 0;
            width: 48px;
            height: 32px;
            justify-content: center;
            bottom: 0;
        }

        :host([toolbarId="directionRight"]) .dock-container--bottom-right {
            right: calc((25vw - 48px) / 2);
            padding: 0;
            border-radius: 12px 12px 0 0;
            width: 48px;
            height: 32px;
            justify-content: center;
            bottom: 0;
        }

        .dock-separator {
            background-color: #374151;
        }

        .dock-separator--row {
            width: 1px;
            height: 16px;
        }

        .dock-separator--column {
            width: 16px;
            height: 1px;
        }

        .handle {
            position: relative;
        }

        .picker-toggle {
            padding: 6px;
            border: none;
            background: transparent;
            color: #6b7280;
            cursor: pointer;
            transition: color 0.2s ease, background-color 0.2s ease;
        }

        .picker-toggle:hover {
            color: #ffffff;
        }

        .picker-toggle.active {
            color: #60a5fa;
            background-color: #1f2937;
            border-radius: 6px;
        }

        .toggle-icon {
            width: 16px;
            height: 16px;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        this.ensureFallbackPosition();
    }

    updated(changedProps) {
        if (changedProps.has('manager')) {
            const oldManager = changedProps.get('manager');
            if (oldManager) oldManager.removeEventListener('change', this.handleManagerChange);
            if (this.manager) this.manager.addEventListener('change', this.handleManagerChange);
        }
        if (changedProps.has('manager') || changedProps.has('toolbarId') || changedProps.has('fallbackPosition')) {
            this.ensureFallbackPosition();
        }
        this.syncSlottedOrientation();
    }

    disconnectedCallback() {
        if (this.manager) this.manager.removeEventListener('change', this.handleManagerChange);
        super.disconnectedCallback();
    }

    handleManagerChange = () => { this.requestUpdate(); };

    ensureFallbackPosition() {
        if (!this.manager || !this.toolbarId) return;
        this.manager.ensurePosition(this.toolbarId, this.fallbackPosition);
    }

    get layout() {
        if (this.layoutConfig) return this.layoutConfig;
        if (this.manager) return this.manager.getLayout(this.toolbarId, this.fallbackPosition);
        return { position: this.fallbackPosition, ...getPosClasses(this.fallbackPosition) };
    }

    get occupiedPositions() {
        if (this.manager) return this.manager.getOccupiedPositions(this.toolbarId);
        return [];
    }

    get isPickerOpen() {
        return this.manager ? this.manager.isPickerOpen(this.toolbarId) : false;
    }

    syncSlottedOrientation() {
        const slot = this.shadowRoot?.querySelector('slot');
        const layout = this.layout;
        if (!slot || !layout?.orientation) return;

        slot.assignedElements({ flatten: true }).forEach((element) => {
            const tagName = element.tagName?.toLowerCase();
            if (!['view-controls', 'size-controls', 'expander-controls'].includes(tagName)) {
                return;
            }
            element.orientation = layout.orientation;
            element.setAttribute('orientation', layout.orientation);
        });
    }

    renderHandle(layout) {
        if (this.disablePositionPicker) return nothing; 

        const isActive = this.isPickerOpen;
        return html`
            <div class="handle">
                <button @click="${this.handlers.togglePicker}" class="picker-toggle ${isActive ? 'active' : ''}">
                    <svg class="toggle-icon" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"></circle><circle cx="19" cy="5" r="2"></circle><circle cx="5" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle><circle cx="5" cy="19" r="2"></circle><circle cx="12" cy="19" r="2"></circle><circle cx="19" cy="19" r="2"></circle></svg>
                </button>
                ${isActive ? html`
                    <position-picker 
                        .toolbar="${this.toolbarId}" 
                        .currentPos="${layout.position}" 
                        .occupiedPositions="${this.occupiedPositions}" 
                        @position-selected="${this.handlers.handlePositionChange}"
                    ></position-picker>
                ` : nothing}
            </div>
        `;
    }

    render() {
        const layout = this.layout;

        return html`
            <div class="${layout.container}" data-orientation="${layout.orientation}" @click="${this.handlers.stopClickPropagation}">
                ${this.renderHandle(layout)}
                ${!this.disablePositionPicker ? html`<div class="${layout.separator}"></div>` : nothing}
                <slot @slotchange="${this.syncSlottedOrientation}"></slot>
            </div>
        `;
    }
}
customElements.define('dock-container', DockContainer);
