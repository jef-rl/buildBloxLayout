import { css } from 'lit';

// Co-located styles for ToolbarContainer; keep this file static and free of state, IO, and DOM access.
export const toolbarContainerStyles = css`
        :host {
            display: block;
            width: 100%;
        }

        .toolbar {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--toolbar-gap, 8px);
            width: 100%;
            min-width: 0;
            box-sizing: border-box;
        }

        .toolbar-item {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 0 0 auto;
        }

        .toolbar-item--stretch {
            flex: 1 1 auto;
            min-width: 0;
        }

        .toolbar-item embed-view {
            width: 100%;
        }

        .toolbar.drag-over {
            outline: 1px dashed rgba(59, 130, 246, 0.8);
            outline-offset: 4px;
            border-radius: 6px;
        }
    `;
