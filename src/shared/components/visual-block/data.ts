
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { provide } from '@lit/context';
import { blockDataContext } from '../../../core/state/contexts.ts';

/**
 * <visual-block-data>
 */
@customElement('visual-block-data')
export class VisualBlockData extends LitElement {
  @provide({ context: blockDataContext })
  @property({ type: Object })
  data: Record<string, any> = {};

  constructor() {
    super();
    this.addEventListener('data-change', (e: any) => {
      this.data = { ...e.detail };
    });
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'visual-block-data': VisualBlockData;
  }
}
