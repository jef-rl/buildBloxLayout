import { css } from 'lit';

// Co-located styles for ToolbarView; keep this file static and free of state, IO, and DOM access.
export const toolbarViewStyles = css`
    :host {
        display: block;
        height: 100%;
        width: 100%;
        position: relative;
    }

    .view-wrapper {
        position: relative;
        height: 100%;
        width: 100%;
    }

    .view-container {
        height: 100%;
        width: 100%;
        position: relative;
        z-index: 1;
    }

    .fallback {
        display: grid;
        place-items: center;
        height: 100%;
        color: #9ca3af;
        font-size: 0.9rem;
        position: absolute;
        inset: 0;
        z-index: 0;
    }
`;
