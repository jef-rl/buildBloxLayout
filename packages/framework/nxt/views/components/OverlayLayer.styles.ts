import { css } from 'lit';

// Co-located styles for OverlayLayer; keep this file static and free of state, IO, and DOM access.
export const overlayLayerStyles = css`
        :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 200;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 0;
        }

        :host([open]) {
            pointer-events: auto;
        }

        .backdrop {
            position: absolute;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.9);
            backdrop-filter: grayscale(100%) blur(1px);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        :host([open]) .backdrop {
            opacity: 1;
        }

        .panel-container {
            position: relative;
            max-width: 90vw;
            max-height: 90vh;
            background-color: #111827;
            border: 1px solid #374151;
            border-top: none;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            overflow: auto;
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            flex-direction: column;
        }

        :host([open]) .panel-container {
            transform: translateY(0);
            opacity: 1;
        }

        .close-button {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 10;
            background: rgba(0, 0, 0, 0.3);
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #e5e7eb;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .close-button:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    `;
