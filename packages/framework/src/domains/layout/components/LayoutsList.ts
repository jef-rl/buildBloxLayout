import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';

@customElement('layouts-list')
export class LayoutsList extends LitElement {
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
            padding: 16px;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        .actions {
            display: flex;
            gap: 8px;
        }
    `;

    private applyPreset(presetName: string) {
        this.uiDispatch?.({ type: 'layout/applyPreset', name: presetName });
    }

    private deletePreset(presetName: string) {
        this.uiDispatch?.({ type: 'layout/deletePreset', name: presetName });
    }

    render() {
        const presets = this.uiState?.layout.presets ?? {};
        return html`
            <h2>Saved Layouts</h2>
            <ul>
                ${Object.keys(presets).map(
                    (presetName) => html`
                        <li>
                            <span>${presetName}</span>
                            <div class="actions">
                                <button @click=${() => this.applyPreset(presetName)}>Apply</button>
                                <button @click=${() => this.deletePreset(presetName)}>Delete</button>
                            </div>
                        </li>
                    `
                )}
            </ul>
        `;
    }
}
