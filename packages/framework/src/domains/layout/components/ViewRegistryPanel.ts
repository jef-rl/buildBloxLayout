import { LitElement, html, css, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { ViewDefinitionSummary } from '../../../types/state';
import { Icons } from '../../../components/Icons';

/**
 * Lightweight registry viewer intended to live inside a dock container.
 * Displays the currently registered view definitions so admins can confirm
 * what is available without leaving design mode.
 */
export class ViewRegistryPanel extends LitElement {
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

    @state() private filter = '';

    static styles = css`
        :host {
            display: block;
            min-width: 220px;
            max-width: 360px;
            color: #e2e8f0;
        }

        .panel {
            display: grid;
            grid-template-rows: auto 1fr;
            gap: 4px;
            padding: 0px;
            background: linear-gradient(180deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95));
            border: 1px solid #1f2937;
            border-radius: 8px;
        }

    
        .title {
            font-size: 14px;
            font-weight: 700;
            color: #cbd5e1;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .title-icon {
            width: 18px;
            height: 18px;
        }

        .filter {
            width: 100%;
            padding: 6px 8px;
            border-radius: 6px;
            border: 1px solid #334155;
            border-width: 0 0 1px 0;
            color: #e2e8f0;
            font-size: 12px;
            outline: none;
        }

        .filter:focus {
            border-color: #3b82f6;
        }

        .list {
            display: grid;
            gap: 1px;
            max-height: 360px;
            overflow: auto;
            padding: 4px 0 4px 4px;
            background: none;
            user-select: none;
        }

        .item {
            display: grid;
            grid-template-columns: 24px 1fr;
            gap: 4px;
            align-items: center;
            padding: 4px 0 0 4px 8px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            user-select: none;
        }

        .item:hover {
            border-color: rgba(59, 130, 246, 0.4);
        }

        .item * {
            user-select: none;
        }

        .item__icon {
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            background: rgba(59, 130, 246, 0.15);
            color: #93c5fd;
            font-size: 12px;
            font-weight: 700;
            overflow: hidden;
        }

        .item__icon img {
            width: 16px;
            height: 16px;
            -webkit-user-drag: none;
        }

        .item__body {
            display: grid;
            gap: 2px;
        }

        .item__title {
            font-size: 13px;
            font-weight: 700;
            color: #e5e7eb;
        }

        .item__meta {
            font-size: 11px;
            color: #94a3b8;
            display: inline-flex;
            gap: 8px;
        }

        .empty {
            text-align: center;
            padding: 16px;
            color: #94a3b8;
            font-size: 12px;
            border: 1px dashed #334155;
            border-radius: 6px;
            background: rgba(15, 23, 42, 0.6);
        }
    `;

    private getViewIcon(view: ViewDefinitionSummary) {
        if (view.icon) {
            return view.icon;
        }
        const index = Math.abs(this.hash(view.id)) % Icons.length;
        return Icons[index];
    }

    private hash(value: string): number {
        let hashValue = 0;
        for (let i = 0;i < value.length;i += 1) {
            hashValue = (hashValue << 5) - hashValue + value.charCodeAt(i);
            hashValue |= 0;
        }
        return hashValue;
    }

    private handleFilterInput(event: Event) {
        const nextValue = (event.target as HTMLInputElement)?.value ?? '';
        this.filter = nextValue;
    }

    private resolveViews(): ViewDefinitionSummary[] {
        const definitions = this.uiState?.viewDefinitions ?? [];
        const normalized = Array.isArray(definitions) ? definitions : [];
        const query = this.filter.trim().toLowerCase();
        if (!query) {
            return normalized;
        }
        return normalized.filter((view) => {
            const haystack = `${view.title ?? ''} ${view.name ?? ''} ${view.id ?? ''}`.toLowerCase();
            return haystack.includes(query);
        });
    }

    render() {
        const views = this.resolveViews();
        const hasViews = views.length > 0;
        return html`
            <div class="panel">
                <div class="header">
                    <div class="title">
                        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="4" ry="4" stroke="#60a5fa"></rect>
                            <path d="M7 8h10M7 12h6M7 16h4" stroke="#93c5fd" stroke-linecap="round"></path>
                        </svg>
                    </div>
                </div>

                <input
                    class="filter"
                    type="search"
                    placeholder="Filter views..."
                    .value=${this.filter}
                    @input=${this.handleFilterInput}
                />

                <div class="list" role="list">
                    ${hasViews
                ? views.map((view) => {
                    const icon = this.getViewIcon(view);
                    return html`
                                <div class="item" role="listitem">
                                    <span class="item__icon">
                                        <img
                                            src="https://storage.googleapis.com/lozzuck.appspot.com/blox/icons/${icon}.png"
                                            alt="${icon}"
                                        />
                                    </span>
                                    <div class="item__body">
                                        <div class="item__title">${view.title ?? view.name ?? view.id}</div>
                                        <div class="item__meta">
                                            <span>ID: ${view.id}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                })
                : html`<div class="empty">No registered views found.</div>`}
                </div>
            </div>
        `;
    }
}

customElements.define('view-registry-panel', ViewRegistryPanel);
