// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { LayoutPreset } from '../../../types/state';
import { createPresetManagerHandlers } from '../handlers/preset-manager.handlers';

export class PresetManager extends LitElement {
    @property({ type: String }) orientation = 'row';

    @state() private showSaveDialog = false;
    @state() private newPresetName = '';
    @state() private editingPresetName: string | null = null;
    @state() private editedName = '';

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

    private handlers = createPresetManagerHandlers(this, () => this.uiDispatch);

    static styles = css`
        :host {
            display: block;
        }

        .preset-manager {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px;
            min-width: 180px;
            max-width: 280px;
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #374151;
        }

        .header__title {
            font-size: 11px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .save-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 8px;
            border-radius: 4px;
            border: none;
            background: #2563eb;
            color: #ffffff;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .save-button:hover {
            background: #1d4ed8;
        }

        .preset-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
            max-height: 200px;
            overflow-y: auto;
        }

        .preset-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            padding: 6px 8px;
            border-radius: 4px;
            background: transparent;
            transition: background-color 0.2s ease;
        }

        .preset-item:hover {
            background: rgba(55, 65, 81, 0.5);
        }

        .preset-item.active {
            background: rgba(37, 99, 235, 0.2);
            border-left: 2px solid #2563eb;
        }

        .preset-name {
            flex: 1;
            font-size: 12px;
            color: #e5e7eb;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
        }

        .preset-name:hover {
            color: #ffffff;
        }

        .preset-actions {
            display: flex;
            align-items: center;
            gap: 2px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .preset-item:hover .preset-actions {
            opacity: 1;
        }

        .action-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            padding: 0;
            border-radius: 4px;
            border: none;
            background: transparent;
            color: #9ca3af;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        .action-button:hover {
            background: #374151;
            color: #ffffff;
        }

        .action-button.delete:hover {
            background: #dc2626;
            color: #ffffff;
        }

        .save-dialog {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px;
            background: #1f2937;
            border-radius: 6px;
            border: 1px solid #374151;
        }

        .save-dialog__input {
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid #374151;
            background: #111827;
            color: #e5e7eb;
            font-size: 12px;
            outline: none;
        }

        .save-dialog__input:focus {
            border-color: #2563eb;
        }

        .save-dialog__actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
        }

        .dialog-button {
            padding: 4px 10px;
            border-radius: 4px;
            border: none;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .dialog-button.primary {
            background: #2563eb;
            color: #ffffff;
        }

        .dialog-button.primary:hover {
            background: #1d4ed8;
        }

        .dialog-button.secondary {
            background: #374151;
            color: #e5e7eb;
        }

        .dialog-button.secondary:hover {
            background: #4b5563;
        }

        .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            color: #6b7280;
            font-size: 11px;
            text-align: center;
        }

        .edit-input {
            flex: 1;
            padding: 2px 4px;
            border-radius: 2px;
            border: 1px solid #2563eb;
            background: #111827;
            color: #e5e7eb;
            font-size: 12px;
            outline: none;
        }
    `;

    private get presets(): LayoutPreset[] {
        const presetsMap = this.uiState?.layout?.presets ?? {};
        return Object.values(presetsMap);
    }

    private get activePresetName(): string | null {
        return this.uiState?.layout?.activePreset ?? null;
    }

    private openSaveDialog() {
        this.showSaveDialog = true;
        this.newPresetName = '';
    }

    private closeSaveDialog() {
        this.showSaveDialog = false;
        this.newPresetName = '';
    }

    private handleSaveInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.newPresetName = input.value;
    }

    private handleSaveInputKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.confirmSave();
        } else if (event.key === 'Escape') {
            this.closeSaveDialog();
        }
    }

    private confirmSave() {
        if (this.newPresetName.trim()) {
            this.handlers.savePreset(this.newPresetName.trim());
            this.closeSaveDialog();
        }
    }

    private handleLoad(name: string) {
        this.handlers.loadPreset(name);
    }

    private handleDelete(name: string) {
        this.handlers.deletePreset(name);
    }

    private startRename(name: string) {
        this.editingPresetName = name;
        this.editedName = name;
    }

    private handleRenameInputChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.editedName = input.value;
    }

    private handleRenameInputKeydown(event: KeyboardEvent, oldName: string) {
        if (event.key === 'Enter') {
            this.confirmRename(oldName);
        } else if (event.key === 'Escape') {
            this.cancelRename();
        }
    }

    private confirmRename(oldName: string) {
        if (this.editedName.trim() && this.editedName.trim() !== oldName) {
            this.handlers.renamePreset(oldName, this.editedName.trim());
        }
        this.cancelRename();
    }

    private cancelRename() {
        this.editingPresetName = null;
        this.editedName = '';
    }

    render() {
        const presets = this.presets;
        const activePreset = this.activePresetName;

        return html`
            <div class="preset-manager" @click=${this.handlers.stopClickPropagation}>
                <div class="header">
                    <span class="header__title">Layout Presets</span>
                    <button
                        class="save-button"
                        @click=${() => this.openSaveDialog()}
                        title="Save current layout as preset"
                    >
                        Save
                    </button>
                </div>

                ${this.showSaveDialog ? html`
                    <div class="save-dialog">
                        <input
                            type="text"
                            class="save-dialog__input"
                            placeholder="Enter preset name..."
                            .value=${this.newPresetName}
                            @input=${this.handleSaveInputChange}
                            @keydown=${this.handleSaveInputKeydown}
                            autofocus
                        />
                        <div class="save-dialog__actions">
                            <button
                                class="dialog-button secondary"
                                @click=${() => this.closeSaveDialog()}
                            >
                                Cancel
                            </button>
                            <button
                                class="dialog-button primary"
                                @click=${() => this.confirmSave()}
                                ?disabled=${!this.newPresetName.trim()}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ` : nothing}

                <div class="preset-list">
                    ${presets.length === 0 ? html`
                        <div class="empty-state">
                            No presets saved yet.<br/>
                            Click "Save" to create one.
                        </div>
                    ` : presets.map(preset => html`
                        <div class="preset-item ${activePreset === preset.name ? 'active' : ''}">
                            ${this.editingPresetName === preset.name ? html`
                                <input
                                    type="text"
                                    class="edit-input"
                                    .value=${this.editedName}
                                    @input=${this.handleRenameInputChange}
                                    @keydown=${(e: KeyboardEvent) => this.handleRenameInputKeydown(e, preset.name)}
                                    @blur=${() => this.confirmRename(preset.name)}
                                    autofocus
                                />
                            ` : html`
                                <span
                                    class="preset-name"
                                    @click=${() => this.handleLoad(preset.name)}
                                    @dblclick=${() => this.startRename(preset.name)}
                                    title="Click to load, double-click to rename"
                                >
                                    ${preset.name}
                                </span>
                            `}
                            <div class="preset-actions">
                                <button
                                    class="action-button"
                                    @click=${() => this.startRename(preset.name)}
                                    title="Rename preset"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                </button>
                                <button
                                    class="action-button delete"
                                    @click=${() => this.handleDelete(preset.name)}
                                    title="Delete preset"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6h18"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }
}

customElements.define('preset-manager', PresetManager);
