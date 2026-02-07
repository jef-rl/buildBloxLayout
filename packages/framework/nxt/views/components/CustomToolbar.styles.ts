import { css } from 'lit';

// Co-located styles for CustomToolbar; keep this file static and free of state, IO, and DOM access.
export const customToolbarStyles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .grid {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: auto;
            gap: 0px;
            align-items: center;
            height: 100%;
            padding: 0;
        }

        .icon-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            padding: 0px;
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
            width: 32px;
            height: 32px;
        }

        .icon-img {
            width: 32px;
            height: 32px;
            object-fit: contain;
        }

        .separator {
            width: 1px;
            height: 48px;
            background-color: #ffffff33;
            margin: 0 6px;
        }
    `;
