import { css } from "lit";

export const cssDockPicker = css`
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