export function getPosClasses(pos: string) {
    let orientation: 'row' | 'column' = 'row';
    let positionClass = `dock-container--${pos}`;

    switch (pos) {
        case 'top-right':
        case 'middle-right':
        case 'bottom-right':
        case 'bottom-left':
        case 'middle-left':
            orientation = 'column';
            break;
        default:
            orientation = 'row';
            break;
    }

    return {
        container: `dock-container ${positionClass} dock-container--${orientation}`,
        orientation,
        separator: `dock-separator dock-separator--${orientation}`
    };
}

export function getPickerStyles(pos: string) {
    const common = "position: absolute; z-index: 60; pointer-events: auto;";
    switch (pos) {
        case 'top-center':
            return `${common} top: 100%; left: 50%; transform: translateX(-50%); margin-top: 12px;`;
        case 'bottom-center':
            return `${common} bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px;`;
        case 'top-right':
        case 'middle-right':
        case 'bottom-right':
            return `${common} top: 50%; right: 100%; transform: translateY(-50%); margin-right: 12px;`;
        case 'middle-left':
        case 'bottom-left':
            return `${common} top: 50%; left: 100%; transform: translateY(-50%); margin-left: 12px;`;
        default:
            return `${common} bottom: 100%; left: 50%; transform: translateX(-50%); margin-bottom: 2px;`;
    }
}

export function getArrowStyles(pos: string) {
    const common = "position: absolute; width: 8px; height: 8px; background-color: #111827; border: 1px solid #4b5563; z-index: -1;";
    switch (pos) {
        case 'top-center': return `${common} top: -5px; left: 50%; transform: translateX(-50%) rotate(45deg); border-right: none; border-bottom: none;`;
        case 'bottom-center': return `${common} bottom: -5px; left: 50%; transform: translateX(-50%) rotate(45deg); border-left: none; border-top: none;`;
        case 'top-right':
        case 'middle-right':
        case 'bottom-right': return `${common} right: -5px; top: 50%; transform: translateY(-50%) rotate(45deg); border-left: none; border-bottom: none;`;
        case 'middle-left':
        case 'bottom-left': return `${common} left: -5px; top: 50%; transform: translateY(-50%) rotate(45deg); border-right: none; border-top: none;`;
        default: return `${common} bottom: -5px; left: 50%; transform: translateX(-50%) rotate(45deg); border-left: none; border-top: none;`;
    }
}

export function gridIndexToPos(index: number) {
    const map: Record<number, string> = {
        1: 'top-center',
        2: 'top-right',
        3: 'middle-left',
        5: 'middle-right',
        6: 'bottom-left',
        7: 'bottom-center',
        8: 'bottom-right'
    };
    return map[index];
}
