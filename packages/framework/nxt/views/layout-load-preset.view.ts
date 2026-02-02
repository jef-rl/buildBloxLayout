import { LitElement, html, css } from 'lit';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../context/context.state';
import { LayoutPreset } from '../types/state.types';
import { UiStateContextValue } from '../context/ui.state';

/**
 * Content component for loading a saved preset.
 * Designed to be rendered inside the generic overlay-expander.
 */
export class LoadPresetContent extends LitElement {
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

    static styles = css`
        :host {
            display: block;
            width: 320px;
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

        .dialog-content {
            padding: 12px;
        }

        .preset-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            max-height: 280px;
            overflow-y: auto;
        }

        .preset-item {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            border-radius: 6px;
            background: transparent;
            cursor: pointer;
            transition: background-color 0.15s ease;
        }

        .preset-item:hover {
            background: rgba(55, 65, 81, 0.5);
        }

        .preset-item.active {
            background: rgba(37, 99, 235, 0.2);
            border-left: 2px solid #2563eb;
            padding-left: 10px;
        }

        .preset-name {
            flex: 1;
            font-size: 13px;
            color: #e5e7eb;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .preset-item.active .preset-name {
            color: #93c5fd;
        }

        .empty-state {
            padding: 24px 16px;
            text-align: center;
            color: #6b7280;
            font-size: 13px;
            line-height: 1.5;
        }

        .dialog-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 12px 20px;
            border-top: 1px solid #374151;
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
    `;

    private get presets(): LayoutPreset[] {
        const presetsMap = this.uiState?.layout?.presets ?? {};
        return Object.values(presetsMap);
    }

    private get activePresetName(): string | null {
        return this.uiState?.layout?.activePreset ?? null;
    }

    private handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    private close() {
        this.uiDispatch?.({ type: 'layout/setOverlayView', viewId: null });
    }

    private handleLoad(name: string) {
        this.uiDispatch?.({ type: 'presets/load', name });
        this.uiDispatch?.({ type: 'layout/setOverlayView', viewId: null });
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('keydown', this.handleKeydown);
    }

    disconnectedCallback() {
        this.removeEventListener('keydown', this.handleKeydown);
        super.disconnectedCallback();
    }

    render() {
        const presets = this.presets;
        const activePreset = this.activePresetName;

        return html`
            <div class="dialog-header">
                <span class="dialog-title">Load Layout Preset</span>
            </div>
            <div class="dialog-content">
                ${presets.length === 0 ? html`
                    <div class="empty-state">
                        No presets saved yet.<br/>
                        Use the Save button to create one.
                    </div>
                ` : html`
                    <div class="preset-list">
                        ${presets.map(preset => html`
                            <div
                                class="preset-item ${activePreset === preset.name ? 'active' : ''}"
                                @click=${() => this.handleLoad(preset.name)}
                            >
                                <span class="preset-name">${preset.name}</span>
                            </div>
                        `)}
                    </div>
                `}
            </div>
            <div class="dialog-actions">
                <button
                    class="action-button secondary"
                    @click=${this.close}
                >
                    Cancel
                </button>
            </div>
        `;
    }
}

customElements.define('load-preset-content', LoadPresetContent);
