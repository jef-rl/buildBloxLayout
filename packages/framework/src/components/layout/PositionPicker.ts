// @ts-nocheck
import { LitElement, html, nothing, css } from 'lit';
import { property } from 'lit/decorators.js';
import { getPickerStyles, getArrowStyles, gridIndexToPos } from '../../utils/helpers';
import { createPositionPickerHandlers } from '../../handlers/layout/position-picker.handlers';
import type { DockPosition } from './DockManager';

export class PositionPicker extends LitElement {
    @property({ type: String }) currentPos = '';
    @property({ type: String }) toolbar = '';
    @property({ type: Array }) occupiedPositions: DockPosition[] = [];
    handlers = createPositionPickerHandlers(this);

    static styles = css`
        :host {
            position: absolute;
            pointer-events: auto;
        }

        .picker {
            padding: 12px;
            background-color: #111827;
            border: 1px solid #4b5563;
            border-radius: 10px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            place-items: center;
        }

        .spacer {
            width: 16px;
            height: 16px;
        }

        .dot {
            width: 16px;
            height: 16px;
            border-radius: 999px;
            border: 1px solid transparent;
            transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
        }

        .dot.current {
            background-color: #3b82f6;
            border-color: #60a5fa;
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
            transform: scale(1.1);
        }

        .dot.occupied {
            background-color: #1f2937;
            border-color: #374151;
            opacity: 0.4;
            cursor: not-allowed;
        }

        .dot.available {
            background-color: #4b5563;
            cursor: pointer;
        }

        .dot.invalid {
            background-color: #111827;
            border-color: #1f2937;
            opacity: 0.25;
            cursor: not-allowed;
        }

     
    `;

    render() {
        const pickerStyle = getPickerStyles(this.currentPos);
        const arrowStyle = getArrowStyles(this.currentPos);

        return html`
            <div 
                class="picker" 
                style="${pickerStyle} min-width: 90px; min-height: 90px;"
                @click="${this.handlers.stopClickPropagation}"
            >
                <div class="grid">
                    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                        const pos = gridIndexToPos(i);

                        if (i === 4) {
                            return html`<div class="spacer"></div>`;
                        }

                        const { isInvalid, isCurrent, isOccupied, clickHandler } = this.handlers.getDotState(pos);

                        let dotClass = 'dot';
                        if (isInvalid) dotClass += ' invalid';
                        else if (isCurrent) dotClass += ' current';
                        else if (isOccupied) dotClass += ' occupied';
                        else dotClass += ' available';

                        return html`
                            <div 
                                class="${dotClass}" 
                                @click="${clickHandler}"
                                title="${isInvalid ? 'Unavailable' : isOccupied ? 'Occupied' : pos}"
                            ></div>
                        `;
                    })}
                </div>
                <!-- Directional Arrow -->
                <div style="${arrowStyle}"></div>
            </div>
        `;
    }
}
customElements.define('position-picker', PositionPicker);
