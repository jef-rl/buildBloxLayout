// @ts-nocheck
import { LitElement, html, css } from 'lit';
import { ContextProvider } from '@lit/context';
import { uiStateContext } from '../../state/context';
import { DockManager } from './DockManager';
import '../controls/Toolbar';
import '../controls/Resizer';
import '../controls/Expander';
import './DockContainer';
import './OverlayLayer';
import { applyLayoutAction } from '../../handlers/workspace/layout';

export class WorkspaceRoot extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
        }

        .workspace {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .content {
            width: 100%;
            height: 100%;
        }
    `;

    private state = {
        layout: {
            overlayView: null,
            expansion: { left: false, right: false, bottom: false },
            viewportWidthMode: 'auto',
        },
        panels: {
            open: {},
            data: {},
            errors: {},
        },
    };

    private dockManager = new DockManager();

    private provider = new ContextProvider(this, {
        context: uiStateContext,
        initialValue: {
            state: this.state,
            dispatch: (payload: { type: string; [key: string]: unknown }) => this.dispatch(payload),
        },
    });

    private dispatch(payload: { type: string; [key: string]: unknown }) {
        const handledLayout = applyLayoutAction(this.state, payload);

        if (!handledLayout) {
            switch (payload.type) {
                case 'panels/togglePanel':
                    if (payload.panelId || payload.viewId) {
                        const panelId = payload.panelId ?? payload.viewId;
                        this.state.panels.open[panelId] = !this.state.panels.open[panelId];
                    }
                    break;
                case 'panels/setScopeMode':
                    this.state.panels.data = {
                        ...this.state.panels.data,
                        scope: { ...(this.state.panels.data?.scope ?? {}), mode: payload.mode },
                    };
                    break;
                case 'session/reset':
                    this.state.panels.errors = {};
                    this.state.panels.data = {};
                    break;
                default:
                    break;
            }
        }

        this.provider.setValue({
            state: this.state,
            dispatch: (nextPayload: { type: string; [key: string]: unknown }) => this.dispatch(nextPayload),
        });

        this.requestUpdate();
    }

    render() {
        return html`
            <div class="workspace">
                <div class="content">
                    <slot></slot>
                </div>

                <dock-container .manager=${this.dockManager} toolbarId="views">
                    <view-controls></view-controls>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="viewport" fallbackPosition="bottom-right">
                    <size-controls></size-controls>
                </dock-container>

                <dock-container .manager=${this.dockManager} toolbarId="expander" fallbackPosition="bottom-left" disablePositionPicker>
                    <expander-controls></expander-controls>
                </dock-container>

                <overlay-expander .viewId="${this.state.layout.overlayView}"></overlay-expander>
            </div>
        `;
    }
}

customElements.define('workspace-root', WorkspaceRoot);
