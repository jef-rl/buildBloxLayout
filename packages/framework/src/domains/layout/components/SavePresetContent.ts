import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';

/**
 * Content component for saving a new preset.
 * Designed to be rendered inside the generic overlay-expander.
 */
export class SavePresetContent extends LitElement {
    @state() private presetName = '';

    private uiState: UiStateContextValue['state'] | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;
    private hasInitialized = false;

    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue | undefined) => {
            this.uiState = value?.state ?? null;
            this.uiDispatch = value?.dispatch ?? null;
            // Initialize preset name from active preset on first context update
            if (!this.hasInitialized && this.uiState?.layout?.activePreset) {
                this.presetName = this.uiState.layout.activePreset;
                this.hasInitialized = true;
            }
        },
    });

    static styles = css`
        :host {
            display: block;
            width: 320px;
            background : #3a4f78;
        }

        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid #374151;
        }

        .dialog-title {
            font-size: 14px;
            font-weight: 600;
            color: #f3f4f6;
            letter-spacing: 0.3px;
        }

        .dialog-content {
            padding: 20px;
        }

        .input-group {
            margin-bottom: 16px;
        }

        .input-label {
            display: block;
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: 500;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .preset-input {
            width: 100%;
            padding: 10px 12px;
            border-radius: 6px;
            border: 1px solid #374151;
            background: #3a4f78;
            color: #f3f4f6;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            box-sizing: border-box;
        }

        .preset-input:focus {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .preset-input::placeholder {
            color: #6b7280;
        }

        .dialog-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
        }

        .action-button {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .action-button.secondary {
            background: #3a4f78;
            color: #e5e7eb;
        }

        .action-button.secondary:hover {
            background: #4b5563;
        }

        .action-button.primary {
            background: #2563eb;
            color: #ffffff;
        }

        .action-button.primary:hover:not(:disabled) {
            background: #1d4ed8;
        }

        .action-button.primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;

    private handleInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.presetName = input.value;
    }

    private handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.presetName.trim()) {
            this.confirmSave();
        } else if (event.key === 'Escape') {
            this.close();
        }
    }

    private close() {
        this.presetName = '';
        this.uiDispatch?.({ type: 'layout/setOverlayView', viewId: null });
    }

    private confirmSave() {
        if (this.presetName.trim()) {
            this.uiDispatch?.({ type: 'presets/save', name: this.presetName.trim() });
            this.presetName = '';
            this.uiDispatch?.({ type: 'layout/setOverlayView', viewId: null });
        }
    }

    connectedCallback() {
        super.connectedCallback();
        // Reset initialization flag so we pick up the current active preset
        this.hasInitialized = false;
        // Initialize from active preset if context is already available
        if (this.uiState?.layout?.activePreset) {
            this.presetName = this.uiState.layout.activePreset;
            this.hasInitialized = true;
        }
        // Focus the input when connected
        requestAnimationFrame(() => {
            const input = this.shadowRoot?.querySelector('.preset-input') as HTMLInputElement;
            input?.focus();
            input?.select();
        });
    }

    render() {
        return html`
            <div class="dialog-header">
                <span class="dialog-title">Save Layout Preset</span>
            </div>
            <div class="dialog-content">
                <div class="input-group">
                    <label class="input-label">Preset Name</label>
                    <input
                        type="text"
                        class="preset-input"
                        placeholder="Enter a name for this layout..."
                        .value=${this.presetName}
                        @input=${this.handleInputChange}
                        @keydown=${this.handleKeydown}
                    />
                </div>
                <div class="dialog-actions">
                    <button
                        class="action-button secondary"
                        @click=${this.close}
                    >
                        Cancel
                    </button>
                    <button
                        class="action-button primary"
                        @click=${this.confirmSave}
                        ?disabled=${!this.presetName.trim()}
                    >
                        Save Preset
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('save-preset-content', SavePresetContent);
