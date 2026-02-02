import { LitElement, css, html } from "lit";
import { DockPosition } from "./dock-manager.view";
import { createPositionPickerHandlers } from "./dock-position-picker.handlers";
import { getPickerStyles, getArrowStyles, gridIndexToPos } from "../helpers/dock.utils";
import { property } from "lit/decorators";
import { cssDockPicker } from "./dock-position-picker.styles";

export class PositionPicker extends LitElement {
    @property({ type: String }) currentPos = '';
    @property({ type: String }) toolbar = '';
    @property({ type: Array }) occupiedPositions: DockPosition[] = [];
    handlers = createPositionPickerHandlers(this);

    static styles = cssDockPicker

    render() {
        const pickerStyle = getPickerStyles(this.currentPos);
        const arrowStyle = getArrowStyles(this.currentPos);

        return html`
            <div 
                class="picker" 
                style="${pickerStyle} min-width: 90px; min-height: 90px;"
                @click=${this.handlers.stopClickPropagation}
            >
                <div class="grid">
                    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                        
                        const pos = gridIndexToPos(i) ?? null;

                        if (i === 4) {
                            return html`<div class="spacer"></div>`;
                        }

                        const { isInvalid, isCurrent, isOccupied, clickHandler } = pos!==null ?  this.handlers.getDotState(pos as DockPosition) : { isInvalid: true, isCurrent: false, isOccupied: false, clickHandler: () => {}};

                        let dotClass = 'dot';
                        if (isInvalid) dotClass += ' invalid';
                        else if (isCurrent) dotClass += ' current';
                        else if (isOccupied) dotClass += ' occupied';
                        else dotClass += ' available';

                        return html`
                            <div 
                                class="${dotClass}" 
                                @click=${clickHandler}
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
