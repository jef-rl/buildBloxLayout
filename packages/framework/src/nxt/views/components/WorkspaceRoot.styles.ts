import { css } from 'lit';

// Co-located styles for WorkspaceRoot; keep this file static and free of state, IO, and DOM access.
export const workspaceRootStyles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            z-index:50;
            background-color: #0f172a;
        }

        .workspace {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .layout {
            position: relative;
            display: grid;
            grid-template-columns: var(--left-width) minmax(0, 1fr) var(--right-width);
            grid-template-rows: minmax(0, 1fr) var(--bottom-height);
            width: 100%;
            height: 100%;
            transition: grid-template-columns 0.2s ease, grid-template-rows 0.2s ease;
        }

        .expander {
            position: relative;
            background-color: #111827;
            border: 1px solid #1f2937;
            overflow: visible;
            transition: opacity 0.2s ease;
            display: flex;
            flex-direction: column;
        }

        .expander.collapsed {
            opacity: 1;
            border-width: 0;
        }

        .expander-left {
            grid-column: 1;
            grid-row: 1 / span 2;
        }

        .expander-right {
            grid-column: 3;
            grid-row: 1 / span 2;
        }

        .expander-bottom {
            grid-column: 2;
            grid-row: 2;
            border-top: none;
        }

        .main-area {
            grid-column: 2;
            grid-row: 1;
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: var(--main-panel-width);
            grid-template-columns: repeat(auto-fit, var(--main-panel-width));
            height: 100%;
            min-width: 0;
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            background-color: #0b1220;
            z-inddex:0;
        }

        .main-panel {
            min-height: 0;
            min-width: 0;
            border-left: 1px solid #1f2937;
            position: relative;
        }

        .panel-shell {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .panel-content {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 0;
            min-width: 0;
            z-index: 0;
        }

        .view-overlay {
            position: absolute;
            inset: 0;
            z-index: 2;
        }

        .panel-shell.design-active .panel-content {
            pointer-events: none;
            user-select: none;
            -webkit-user-select: none;
        }

        .main-panel:first-child {
            border-left: none;
        }

        /* Stack Styles */
        .side-panel-stack {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            overflow-y: auto;
        }

        .stack-item {
            flex: 0 0 auto;
            min-height: 200px;
            border-bottom: 1px solid #1f2937;
            position: relative;
        }

        .drop-zone {
            height: 10px;
            flex-shrink: 0;
            transition: all 0.2s ease;
            background: transparent;
        }

        .drop-zone:hover, .drop-zone.drag-over {
            height: 40px;
            background: rgba(59, 130, 246, 0.1);
            border: 2px dashed #3b82f6;
        }
        
        .drop-zone.top {
            border-bottom: none;
        }
        
        .drop-zone.bottom {
            border-top: none;
            flex-grow: 1; /* Allow bottom drop zone to fill remaining space */
            min-height: 20px;
        }
        
        .drop-zone.hidden {
            height: 0;
            max-height: 0;
            border: none;
            overflow: hidden;
            padding: 0;
            margin: 0;
        }

        /* Sash Toggles */
        .sash-toggle {
            position: absolute;
            z-index: 999; /* Above panels */
            background-color: #1e293b;
            border: 1px solid #334155;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            color: #94a3b8;
            padding: 0;
        }

        .sash-toggle:hover {
            background-color: #334155;
            color: white;
        }

        .sash-toggle.left {
            left: var(--left-width, 0px);
            top: 120px; /* Y offset */
            width: 24px;
            height: 32px;
            border-left: none;
            border-radius: 0 4px 4px 0;
            transition: left 0.2s ease;
        }

        .sash-toggle.right {
            right: var(--right-width, 0px);
            top: 120px; /* Y offset */
            width: 24px;
            height: 32px;
            border-right: none;
            border-radius: 4px 0 0 4px;
            transition: right 0.2s ease;
        }

        .sash-toggle.bottom {
            bottom: var(--bottom-height, 0px);
            left: 120px; /* X offset */
            width: 32px;
            height: 24px;
            border-bottom: none;
            border-radius: 4px 4px 0 0;
            transition: bottom 0.2s ease;
        }
    `;
