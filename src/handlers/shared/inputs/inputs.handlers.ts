import type { LitElement } from 'lit';
import type { ValueChangeDetail } from '../../state/event-types';

export function createBooleanInputHandlers(component: LitElement & { value: boolean }) {
  return {
    handleToggle: () => {
      component.dispatchEvent(new CustomEvent<ValueChangeDetail<boolean>>('value-change', {
        detail: !component.value,
        bubbles: true,
        composed: true,
      }));
    },
  };
}

export function createTextInputHandlers(component: LitElement) {
  return {
    handleInput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      component.dispatchEvent(new CustomEvent<ValueChangeDetail<string>>('value-change', {
        detail: target.value,
        bubbles: true,
        composed: true,
      }));
    },
  };
}

export function createNumberInputHandlers(component: LitElement) {
  return {
    handleInput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      if (!Number.isNaN(value)) {
        component.dispatchEvent(new CustomEvent<ValueChangeDetail<number>>('value-change', {
          detail: value,
          bubbles: true,
          composed: true,
        }));
      }
    },
  };
}

export function createSliderInputHandlers(component: LitElement) {
  return {
    handleInput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      component.dispatchEvent(new CustomEvent<ValueChangeDetail<number>>('value-change', {
        detail: Number(target.value),
        bubbles: true,
        composed: true,
      }));
    },
  };
}

export function createColorInputHandlers(component: LitElement) {
  return {
    handleInput: (event: Event) => {
      const target = event.target as HTMLInputElement;
      component.dispatchEvent(new CustomEvent<ValueChangeDetail<string>>('value-change', {
        detail: target.value,
        bubbles: true,
        composed: true,
      }));
    },
  };
}
