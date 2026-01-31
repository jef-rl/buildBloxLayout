import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { ExpanderState } from '../../../utils/expansion-helpers.js';

@customElement('custom-toolbar')
export class CustomToolbar extends LitElement {
    
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
            width: 100%;
            height: 100%;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(26, 1fr);
            gap: 2px;
            align-items: center;
            height: 100%;
            padding: 0 4px;
        }

        .icon-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 28px;
            padding: 4px;
            border-radius: 4px;
            border: none;
            background: transparent;
            color: #94a3b8;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 10px;
            font-weight: 600;
        }

        .icon-button:hover {
            color: #f8fafc;
            background-color: rgba(255, 255, 255, 0.1);
        }

        .icon {
            width: 16px;
            height: 16px;
        }
        
        .icon-img {
            width: 16px;
            height: 16px;
            object-fit: contain;
        }

        .separator {
            width: 1px;
            height: 16px;
            background-color: #334155;
            margin: 0 auto;
        }
    `;

    private setExpanderState(side: 'left' | 'right' | 'bottom', state: ExpanderState) {
        this.uiDispatch?.({ type: 'layout/setExpansion', side, state });
    }
    
    private setMainAreaCount(count: number) {
        this.uiDispatch?.({ type: 'layout/setMainAreaCount', count });
    }

    private setViewportWidthMode(mode: string) {
        this.uiDispatch?.({ type: 'layout/setViewportWidthMode', mode });
    }

    private resetLayout() {
        if (!this.uiDispatch || !this.uiState) {
            return;
        }

        // Reset expander states to 'Closed'
        this.setExpanderState('left', 'Closed');
        this.setExpanderState('bottom', 'Closed');
        this.setExpanderState('right', 'Closed');

        // Clear all main panels
        const mainPanels = this.uiState.panels.filter(p => p.region === 'main');
        mainPanels.forEach(panel => {
            if (panel.id) {
                this.uiDispatch?.({ type: 'panels/removeView', panelId: panel.id });
            }
        });
    }

    private renderButton(index: number, content?: string, isImage: boolean = false, onClick?: () => void) {
        return html`
            <button class="icon-button" title="Action ${index}" @click=${onClick}>
                ${content 
                    ? (isImage 
                        ? html`<img class="icon-img" src="${content}" alt="Action ${index}" />` 
                        : html`<span>${content}</span>`)
                    : html`
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke-width="2" />
                        </svg>
                    `
                }
            </button>
        `;
    }

    private renderSeparator() {
        return html`<div class="separator"></div>`;
    }

    render() {
        return html`
            <div class="grid">
                <!-- 1-4 Buttons: New Icons -->
                ${this.renderButton(1, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/add-96.png', true, () => this.resetLayout())}
                ${this.renderButton(2, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/upload-96.png', true)}
                ${this.renderButton(3, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/edit-96.png', true)}
                ${this.renderButton(4, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/view-quilt-96.png', true)}
                
                <!-- 5 Div -->
                ${this.renderSeparator()}
                
                <!-- 6-9 Buttons -->
                ${this.renderButton(6, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-hidden-48.png', true, () => this.setExpanderState('bottom', 'Collapsed'))}
                ${this.renderButton(7, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-closed-48.png', true, () => this.setExpanderState('bottom', 'Closed'))}
                ${this.renderButton(8, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-open-48.png', true, () => this.setExpanderState('bottom', 'Opened'))}                
                ${this.renderButton(9, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-expanded-48.png', true, () => this.setExpanderState('bottom', 'Expanded'))}
                
                <!-- 10 Div -->
                ${this.renderSeparator()}
                
                <!-- 11-14 Buttons -->
                ${this.renderButton(11, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-hidden-48.png', true, () => this.setExpanderState('right', 'Collapsed'))}
                ${this.renderButton(12, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-closed-48.png', true, () => this.setExpanderState('right', 'Closed'))}
                ${this.renderButton(13, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-open-48.png', true, () => this.setExpanderState('right', 'Opened'))}
                ${this.renderButton(14, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-expanded-48.png', true, () => this.setExpanderState('right', 'Expanded'))}

                
                <!-- 15 Div -->
                ${this.renderSeparator()}
                
                <!-- 16-20 Buttons -->
                ${this.renderButton(16, 'x1', false, () => this.setMainAreaCount(1))}
                ${this.renderButton(17, 'x2', false, () => this.setMainAreaCount(2))}
                ${this.renderButton(18, 'x3', false, () => this.setMainAreaCount(3))}
                ${this.renderButton(19, 'x4', false, () => this.setMainAreaCount(4))}
                ${this.renderButton(20, 'x5', false, () => this.setMainAreaCount(5))}
                
                <!-- 21 Div -->
                ${this.renderSeparator()}
                
                <!-- 22-26 Buttons -->
                ${this.renderButton(22, '1', false, () => this.setViewportWidthMode('1x'))}
                ${this.renderButton(23, '1/2', false, () => this.setViewportWidthMode('2x'))}
                ${this.renderButton(24, '1/3', false, () => this.setViewportWidthMode('3x'))}
                ${this.renderButton(25, '1/4', false, () => this.setViewportWidthMode('4x'))}
                ${this.renderButton(26, '1/5', false, () => this.setViewportWidthMode('5x'))}
            </div>
        `;
    }
}
