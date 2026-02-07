import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import { ActionCatalog } from '../../runtime/actions/action-catalog';
import type { UIState } from '../../types/state';
import type { ExpanderState } from '../../../src/utils/expansion-helpers.js';
import { customToolbarStyles } from './CustomToolbar.styles';

@customElement('custom-toolbar')
export class CustomToolbar extends LitElement {
    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    static styles = [customToolbarStyles];

    private setExpanderState(side: 'left' | 'right' | 'bottom', state: ExpanderState) {
        this.core?.dispatch({ action: ActionCatalog.LayoutSetExpansion, payload: { side, state } });
    }

    private setMainAreaCount(count: number) {
        this.core?.dispatch({ action: ActionCatalog.LayoutSetMainAreaCount, payload: { count } });
    }

    private setViewportWidthMode(mode: string) {
        this.core?.dispatch({ action: ActionCatalog.LayoutSetViewportWidthMode, payload: { mode } });
    }

    private resetLayout() {
        this.core?.dispatch({ action: ActionCatalog.LayoutResetWorkspace, payload: {} });
    }

    private toggleInDesign() {
        this.core?.dispatch({ action: ActionCatalog.LayoutToggleInDesign, payload: {} });
    }

    private openSavePresetOverlay() {
        this.core?.dispatch({ action: ActionCatalog.LayoutSetOverlayView, payload: { viewId: 'save-preset' } });
    }

    private openLoadPresetOverlay() {
        this.core?.dispatch({ action: ActionCatalog.LayoutSetOverlayView, payload: { viewId: 'load-preset' } });
    }

    private renderButton(index: number, content?: string, isImage = false, onClick?: () => void) {
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
                ${this.renderButton(1, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/download-96.png', true, () => this.openLoadPresetOverlay())}
                ${this.renderButton(2, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/upload-96.png', true, () => this.openSavePresetOverlay())}
                ${this.renderButton(3, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/erase-96.png', true, () => this.resetLayout())}
                ${this.renderButton(4, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/view-quilt-96.png', true, () => this.toggleInDesign())}

                ${this.renderSeparator()}

                ${this.renderButton(6, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-hidden-48.png', true, () => this.setExpanderState('left', 'Collapsed'))}
                ${this.renderButton(7, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-closed-48.png', true, () => this.setExpanderState('left', 'Closed'))}
                ${this.renderButton(8, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-open-48.png', true, () => this.setExpanderState('left', 'Opened'))}
                ${this.renderButton(9, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-left-expanded-48.png', true, () => this.setExpanderState('left', 'Expanded'))}

                ${this.renderSeparator()}

                ${this.renderButton(16, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-hidden-48.png', true, () => this.setExpanderState('bottom', 'Collapsed'))}
                ${this.renderButton(17, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-closed-48.png', true, () => this.setExpanderState('bottom', 'Closed'))}
                ${this.renderButton(18, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-open-48.png', true, () => this.setExpanderState('bottom', 'Opened'))}
                ${this.renderButton(19, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-bottom-expanded-48.png', true, () => this.setExpanderState('bottom', 'Expanded'))}

                ${this.renderSeparator()}

                ${this.renderButton(21, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-hidden-48.png', true, () => this.setExpanderState('right', 'Collapsed'))}
                ${this.renderButton(22, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-closed-48.png', true, () => this.setExpanderState('right', 'Closed'))}
                ${this.renderButton(23, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-open-48.png', true, () => this.setExpanderState('right', 'Opened'))}
                ${this.renderButton(24, 'https://storage.googleapis.com/lozzuck.appspot.com/_FrameworkIcons/expander-right-expanded-48.png', true, () => this.setExpanderState('right', 'Expanded'))}

                ${this.renderSeparator()}

                ${this.renderButton(26, 'x1', false, () => this.setMainAreaCount(1))}
                ${this.renderButton(27, 'x2', false, () => this.setMainAreaCount(2))}
                ${this.renderButton(28, 'x3', false, () => this.setMainAreaCount(3))}
                ${this.renderButton(29, 'x4', false, () => this.setMainAreaCount(4))}
                ${this.renderButton(30, 'x5', false, () => this.setMainAreaCount(5))}

                ${this.renderSeparator()}

                ${this.renderButton(32, '1', false, () => this.setViewportWidthMode('1x'))}
                ${this.renderButton(33, '1/2', false, () => this.setViewportWidthMode('2x'))}
                ${this.renderButton(34, '1/3', false, () => this.setViewportWidthMode('3x'))}
                ${this.renderButton(35, '1/4', false, () => this.setViewportWidthMode('4x'))}
                ${this.renderButton(36, '1/5', false, () => this.setViewportWidthMode('5x'))}
            </div>
        `;
    }
}
