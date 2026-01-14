// @ts-nocheck
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { uiStateContext } from '../../core/state/contexts.ts';
import type { UiStateContextValue } from '../../core/state/ui-state.js';
import type { ViewId } from '../../core/types/index.js';
import { viewsRegistry } from '../../core/registry/views.ts';
import { dispatchUiEvent } from '../../shared/utils/dispatch-ui-event';

export class AppPanelView extends LitElement {
    @property({ type: String }) viewId = '';

    @consume({ context: uiStateContext, subscribe: true })
    @property({ attribute: false })
    uiState?: UiStateContextValue;

    static styles = css`
        :host {
            display: block;
            height: 100%;
        }

        .panel {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-width: 280px;
            background-color: #111827;
            border-right: 1px solid #1f2937;
            overflow: hidden;
        }

        .header {
            padding: 16px 24px;
            border-bottom: 1px solid #1f2937;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: #111827;
            flex-shrink: 0;
        }

        .title {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.02em;
            margin: 0;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .icon-button {
            border: none;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: color 0.2s ease;
            padding: 4px;
        }



        .icon-button:disabled {
            color: #4b5563;
            cursor: not-allowed;
        }

        .icon {
            width: 16px;
            height: 16px;
        }

        .content {
            flex: 1;
            overflow: auto;
        }
    `;

    requestClose() {
        if (this.getDisableClose()) return;
        dispatchUiEvent(this, 'view/close');
    }

    requestBack() {
        const backTo = this.getBackTo();
        if (!backTo) return;
        dispatchUiEvent(this, 'view/open', { viewId: backTo });
    }

    render() {
        const open = this.getOpen();
        if (!open) return nothing;
        const title = this.getTitle();
        const backTo = this.getBackTo();
        const disableClose = this.getDisableClose();
        return html`
            <div class="panel">
                <div class="header">
                    <div class="header-actions">
                        ${backTo ? html`
                            <button @click="${() => this.requestBack()}" class="icon-button" title="Back">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                        ` : nothing}
                        <h2 class="title">${title}</h2>
                    </div>
                    <button @click="${() => this.requestClose()}" class="icon-button" ?disabled="${disableClose}">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="content">
                    <slot></slot>
                </div>
            </div>
        `;
    }

    private getViewOptions() {
        return this.uiState?.state?.view?.viewOptions ?? {};
    }

    private getOpen() {
        return this.uiState?.state?.view?.activeView === this.viewId;
    }

    private getTitle() {
        const options = this.getViewOptions();
        const fallbackTitle = viewsRegistry.find((view) => view.id === this.viewId)?.viewTitle ?? '';
        return (options.title as string | undefined) ?? fallbackTitle;
    }

    private getBackTo() {
        const options = this.getViewOptions();
        return (options.backTo as ViewId | undefined) ?? '';
    }

    private getDisableClose() {
        const options = this.getViewOptions();
        const disableFlag = options.disableCloseWhileGenerating;
        const isGenerating = this.uiState?.state?.ai?.isGenerating;
        return (!!disableFlag && !!isGenerating) || (this.viewId === 'ai-prompt' && !!isGenerating);
    }
}
customElements.define('panel-view', AppPanelView);
