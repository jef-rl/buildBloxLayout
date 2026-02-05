import { css } from 'lit';

// Co-located styles for ViewOverlay; keep this file static and free of state, IO, and DOM access.
export const viewOverlayStyles = css`
    :host {
        position: absolute;
        inset: 0;
        display: block;
        z-index: 10;
    }

    :host([active]) {
        pointer-events: all;
    }

    .design-overlay {
        position: absolute;
        inset: 0;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
        border: 1px solid  #3b82f6;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.15);
        background: rgba(148, 163, 184, 0.35);
        opacity: 0;
        transition: opacity 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
    }

    .design-overlay.active {
        opacity: 1;
    }

    .design-overlay.ready {
        border-color: rgba(59, 130, 246, 0.9);
        background: rgba(59, 130, 246, 0.08);
    }

    .remove-button {
        position: absolute;
        top: 8px;
        right: 8px;
        border: none;
        border-radius: 999px;
        background: rgb(50, 10, 10, 0.9);
        color: #e2e8f0;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }

    .remove-button:hover {
        background: rgb(50, 10, 10);
    }
`;
