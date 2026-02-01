// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

/**
 * Overlay dialog for saving a new preset.
 * Renders as a fixed overlay that slides down from the top.
 */
export class SavePresetOverlay extends LitElement {
    @property({ type: Boolean, reflect: true }) open = false;

    @state() private presetName = '';

    static styles = css`
        :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 250;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 0;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .backdrop {
            position: absolute;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(2px);
            opacity: 0;
            transition: opacity 0.25s ease;
        }

        :host([open]) .backdrop {
            opacity: 1;
        }

        .dialog-container {
            position: relative;
            width: 320px;
            background-color: #1f2937;
            border: 1px solid #374151;
            border-top: none;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        }

        :host([open]) .dialog-container {
            transform: translateY(0);
            opacity: 1;
        }

        .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            background: linear-gradient(to bottom, rgba(37, 99, 235, 0.15), transparent);
            border-bottom: 1px solid #374151;
        }

        .dialog-title {
            font-size: 14px;
            font-weight: 600;
            color: #f3f4f6;
            letter-spacing: 0.3px;
        }

        .close-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            padding: 0;
            border: none;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.05);
            color: #9ca3af;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .close-button:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
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
            background: #111827;
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
            background: #374151;
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

    private handleBackdropClick() {
        this.close();
    }

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
        this.dispatchEvent(new CustomEvent('close'));
    }

    private confirmSave() {
        if (this.presetName.trim()) {
            this.dispatchEvent(new CustomEvent('save', {
                detail: { name: this.presetName.trim() }
            }));
            this.presetName = '';
        }
    }

    updated(changedProperties: Map<string, unknown>) {
        if (changedProperties.has('open') && this.open) {
            // Focus the input when opening
            requestAnimationFrame(() => {
                const input = this.shadowRoot?.querySelector('.preset-input') as HTMLInputElement;
                input?.focus();
            });
        }
    }

    render() {
        return html`
            <div class="backdrop" @click=${this.handleBackdropClick}></div>
            <div class="dialog-container" @click=${(e: Event) => e.stopPropagation()}>
                <div class="dialog-header">
                    <span class="dialog-title">Save Layout Preset</span>
                    <button class="close-button" @click=${this.close}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
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
            </div>
        `;
    }
}

customElements.define('save-preset-overlay', SavePresetOverlay);
