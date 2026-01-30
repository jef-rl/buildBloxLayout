import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import { createControlToolbarHandlers } from '../handlers/control-toolbar.handlers';
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
    private handlers = createControlToolbarHandlers(this, () => this.uiDispatch);


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
        this.handlers.setExpansion(side, state);
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
                <!-- 1-4 Buttons: Left Expander Controls -->
                ${this.renderButton(1, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-hidden-48.png', true, () => this.setExpanderState('left', 'Collapsed'))}
                ${this.renderButton(2, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-closed-48.png', true, () => this.setExpanderState('left', 'Closed'))}
                ${this.renderButton(3, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-open-48.png', true, () => this.setExpanderState('left', 'Opened'))}
                ${this.renderButton(4, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-expanded-48.png', true, () => this.setExpanderState('left', 'Expanded'))}
                
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
                ${this.renderButton(11, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-hidden-48.png', true, () => this.setExpanderState('right', 'Collapsed'))}
                ${this.renderButton(12, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-closed-48.png', true, () => this.setExpanderState('right', 'Closed'))}
                ${this.renderButton(13, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-open-48.png', true, () => this.setExpanderState('right', 'Opened'))}
                ${this.renderButton(14, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-expanded-48.png', true, () => this.setExpanderState('right', 'Expanded'))}

                
                <!-- 15 Div -->
                ${this.renderSeparator()}
                
                <!-- 16-20 Buttons -->
                ${this.renderButton(16, 'x1')}
                ${this.renderButton(17, 'x2')}
                ${this.renderButton(18, 'x3')}
                ${this.renderButton(19, 'x4')}
                ${this.renderButton(20, 'x5')}
                
                <!-- 21 Div -->
                ${this.renderSeparator()}
                
                <!-- 22-26 Buttons -->
                ${this.renderButton(22, '1')}
                ${this.renderButton(23, '1/2')}
                ${this.renderButton(24, '1/3')}
                ${this.renderButton(25, '1/4')}
                ${this.renderButton(26, '1/5')}
            </div>
        `;
    }
}
