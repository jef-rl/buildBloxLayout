import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ContextConsumer } from '@lit/context';
import { uiStateContext } from '../../../state/context';
import type { UiStateContextValue } from '../../../state/ui-state';
import type { UIState, FrameworkMenuItem, FrameworkMenuParentItem, FrameworkMenuPresetItem, LayoutPreset } from '../../../types/state';
import { createFrameworkMenuHandlers } from '../handlers/framework-menu.handlers';
import { frameworkMenuPersistence } from '../../../utils/framework-menu-persistence';

export class FrameworkMenu extends LitElement {
    @property({ type: String }) orientation: 'row' | 'column' = 'column';

    @state() private isOpen = false;
    @state() private expandedSubmenus: Set<string> = new Set();
    @state() private draggedItemId: string | null = null;
    @state() private dropTargetId: string | null = null;
    @state() private menuItems: FrameworkMenuItem[] = [];
    private hasHydratedMenu = false;

    private _consumer = new ContextConsumer(this, {
        context: uiStateContext,
        subscribe: true,
        callback: (value: UiStateContextValue) => {
            this.uiState = value?.state ?? null;
            this.uiDispatch = value?.dispatch ?? null;
            if (!this.hasHydratedMenu) {
                this.hasHydratedMenu = true;
                this.handlers.hydrateMenu();
            }
            this.refreshMenuItems();
        },
    });

    private uiState: UIState | null = null;
    private uiDispatch: UiStateContextValue['dispatch'] | null = null;
    private handlers = createFrameworkMenuHandlers(this, () => this.uiDispatch);
    private boundClickOutside = this.handleClickOutside.bind(this);

    static styles = css`
        :host {
            display: block;
            position: relative;
        }

        .menu-trigger {
            padding: 8px;
            border: none;
            background: transparent;
            color: #9ca3af;
            cursor: pointer;
            transition: color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .menu-trigger:hover {
            color: #ffffff;
        }

        .menu-trigger.active {
            color: #60a5fa;
        }

        .menu-icon {
            width: 20px;
            height: 20px;
        }

        .framework-menu {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 8px;
            min-width: 220px;
            max-width: 320px;
            background: #111827;
            border: 1px solid #374151;
            border-radius: 8px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
            z-index: 100;
            overflow: hidden;
        }

        .menu-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid #374151;
        }

        .menu-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #9ca3af;
        }

        .close-button {
            padding: 4px;
            border: none;
            background: transparent;
            color: #6b7280;
            cursor: pointer;
            transition: color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-button:hover {
            color: #ffffff;
        }

        .close-icon {
            width: 14px;
            height: 14px;
        }

        .menu-items {
            max-height: 400px;
            overflow-y: auto;
            padding: 8px 0;
        }

        .menu-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            color: #e5e7eb;
            cursor: pointer;
            transition: background-color 0.2s ease;
            user-select: none;
        }

        .menu-item:hover {
            background: rgba(55, 65, 81, 0.5);
        }

        .menu-item.dragging {
            opacity: 0.5;
        }

        .menu-item.drop-target {
            background: rgba(37, 99, 235, 0.2);
            border-top: 2px solid #2563eb;
        }

        .menu-item.parent {
            cursor: pointer;
        }

        .menu-item.preset {
            padding-left: calc(16px + var(--depth, 0) * 16px);
        }
        
        .menu-item.action {
            padding-left: calc(16px + var(--depth, 0) * 16px);
        }

        .menu-item-icon {
            width: 16px;
            height: 16px;
            color: #9ca3af;
            flex-shrink: 0;
        }

        .menu-item-label {
            flex: 1;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .menu-item-arrow {
            width: 12px;
            height: 12px;
            color: #6b7280;
            transition: transform 0.2s ease;
            flex-shrink: 0;
        }

        .menu-item-arrow.expanded {
            transform: rotate(90deg);
        }

        .submenu {
            border-left: 1px solid #374151;
            margin-left: 16px;
        }

        .empty-state {
            padding: 24px 16px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }

        .system-badge {
            font-size: 9px;
            padding: 2px 6px;
            background: rgba(37, 99, 235, 0.2);
            color: #60a5fa;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
    `;

    connectedCallback() {
        super.connectedCallback();
        this.refreshMenuItems();
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.boundClickOutside);
        super.disconnectedCallback();
    }

    private getSystemPresetItems(): FrameworkMenuPresetItem[] {
        const presets = this.uiState?.layout?.presets ?? {};
        const systemPresets = Object.values(presets).filter(
            (p): p is LayoutPreset => p.isSystemPreset === true
        );

        if (systemPresets.length > 0) {
            return systemPresets.map((preset, index) => ({
                id: `preset-${preset.name}`,
                type: 'preset' as const,
                label: preset.name,
                presetName: preset.name,
                order: index,
            }));
        }
        return [];
    }

    private refreshMenuItems() {
        const menuItems = this.uiState?.layout?.frameworkMenu?.items;
        if (menuItems && menuItems.length > 0) {
            this.menuItems = menuItems;
            return;
        }

        const saved = frameworkMenuPersistence.load();
        if (saved?.items?.length) {
            this.menuItems = saved.items;
            return;
        }

        const systemPresets = this.getSystemPresetItems();
        this.menuItems = systemPresets;
    }

    private toggleMenu() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            setTimeout(() => {
                document.addEventListener('click', this.boundClickOutside);
            }, 0);
        } else {
            document.removeEventListener('click', this.boundClickOutside);
            this.expandedSubmenus.clear();
        }
    }

    private handleClickOutside(event: Event) {
        const path = event.composedPath();
        if (!path.includes(this)) {
            this.isOpen = false;
            document.removeEventListener('click', this.boundClickOutside);
        }
    }

    private toggleSubmenu(itemId: string) {
        const newSet = new Set(this.expandedSubmenus);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        this.expandedSubmenus = newSet;
    }

    private handlePresetClick(item: FrameworkMenuPresetItem) {
        this.handlers.loadPreset(item);
        this.isOpen = false;
        document.removeEventListener('click', this.boundClickOutside);
    }

    private handleActionClick(item: FrameworkMenuItem) {
        this.handlers.executeAction(item);
        this.isOpen = false;
        document.removeEventListener('click', this.boundClickOutside);
    }

    private handleDragStart(event: DragEvent, itemId: string) {
        this.draggedItemId = itemId;
        event.dataTransfer?.setData('text/plain', itemId);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    private handleDragOver(event: DragEvent, targetId: string) {
        event.preventDefault();
        if (this.draggedItemId && this.draggedItemId !== targetId) {
            this.dropTargetId = targetId;
        }
    }

    private handleDragLeave() {
        this.dropTargetId = null;
    }

    private handleDrop(event: DragEvent, targetId: string) {
        event.preventDefault();
        if (this.draggedItemId && this.draggedItemId !== targetId) {
            this.menuItems = frameworkMenuPersistence.reorderItems(
                this.menuItems,
                this.draggedItemId,
                targetId
            );
            frameworkMenuPersistence.save({ version: 1, items: this.menuItems });
        }
        this.draggedItemId = null;
        this.dropTargetId = null;
    }

    private handleDragEnd() {
        this.draggedItemId = null;
        this.dropTargetId = null;
    }

    private renderMenuItem(item: FrameworkMenuItem, depth: number = 0): TemplateResult | typeof nothing {
        if (item.type === 'parent') {
            return this.renderParentItem(item as FrameworkMenuParentItem, depth);
        }
        if (item.type === 'preset') {
            return this.renderPresetItem(item as FrameworkMenuPresetItem, depth);
        }
        if (item.type === 'action') {
            return this.renderActionItem(item, depth);
        }
        return nothing;
    }

    private renderIcon(icon: string | undefined, fallbackType: FrameworkMenuItem['type']) {
        switch (icon) {
            case 'designer':
                return html`
                    <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20h9" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
                    </svg>
                `;
            case 'login':
                return html`
                    <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 17l5-5-5-5" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H3" />
                    </svg>
                `;
            case 'logout':
                return html`
                    <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 17l5-5-5-5" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H9" />
                    </svg>
                `;
            case 'person':
                return html`
                    <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20a8 8 0 0116 0" />
                    </svg>
                `;
            case 'account_circle':
                return html`
                    <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20a8 8 0 0116 0" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                `;
            default:
                if (fallbackType === 'parent') {
                    return html`
                        <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    `;
                }
                if (fallbackType === 'preset') {
                    return html`
                        <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    `;
                }
                return html`
                    <svg class="menu-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                `;
        }
    }

    private renderParentItem(item: FrameworkMenuParentItem, depth: number): TemplateResult {
        const isExpanded = this.expandedSubmenus.has(item.id);
        const isDragging = this.draggedItemId === item.id;
        const isDropTarget = this.dropTargetId === item.id;

        return html`
            <div
                class="menu-item parent ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}"
                style="--depth: ${depth}"
                draggable="true"
                @click=${() => this.toggleSubmenu(item.id)}
                @dragstart=${(e: DragEvent) => this.handleDragStart(e, item.id)}
                @dragover=${(e: DragEvent) => this.handleDragOver(e, item.id)}
                @dragleave=${() => this.handleDragLeave()}
                @drop=${(e: DragEvent) => this.handleDrop(e, item.id)}
                @dragend=${() => this.handleDragEnd()}
            >
                ${this.renderIcon(item.icon, item.type)}
                <span class="menu-item-label">${item.label}</span>
                <svg class="menu-item-arrow ${isExpanded ? 'expanded' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </div>
            ${isExpanded ? html`
                <div class="submenu">
                    ${item.children.map((child): TemplateResult | typeof nothing => this.renderMenuItem(child, depth + 1))}
                </div>
            ` : nothing}
        `;
    }

    private renderPresetItem(item: FrameworkMenuPresetItem, depth: number) {
        const isDragging = this.draggedItemId === item.id;
        const isDropTarget = this.dropTargetId === item.id;

        return html`
            <div
                class="menu-item preset ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}"
                style="--depth: ${depth}"
                draggable="true"
                @click=${() => this.handlePresetClick(item)}
                @dragstart=${(e: DragEvent) => this.handleDragStart(e, item.id)}
                @dragover=${(e: DragEvent) => this.handleDragOver(e, item.id)}
                @dragleave=${() => this.handleDragLeave()}
                @drop=${(e: DragEvent) => this.handleDrop(e, item.id)}
                @dragend=${() => this.handleDragEnd()}
            >
                ${this.renderIcon(item.icon, item.type)}
                <span class="menu-item-label">${item.label}</span>
            </div>
        `;
    }

    private renderActionItem(item: FrameworkMenuItem, depth: number) {
        const isDragging = this.draggedItemId === item.id;
        const isDropTarget = this.dropTargetId === item.id;

        return html`
            <div
                class="menu-item action ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}"
                style="--depth: ${depth}"
                draggable="true"
                @click=${() => this.handleActionClick(item)}
                @dragstart=${(e: DragEvent) => this.handleDragStart(e, item.id)}
                @dragover=${(e: DragEvent) => this.handleDragOver(e, item.id)}
                @dragleave=${() => this.handleDragLeave()}
                @drop=${(e: DragEvent) => this.handleDrop(e, item.id)}
                @dragend=${() => this.handleDragEnd()}
            >
                ${this.renderIcon(item.icon, item.type)}
                <span class="menu-item-label">${item.label}</span>
            </div>
        `;
    }

    render() {
        return html`
            <button
                class="menu-trigger ${this.isOpen ? 'active' : ''}"
                @click=${(e: Event) => { e.stopPropagation(); this.toggleMenu(); }}
            >
                <svg class="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            ${this.isOpen ? html`
                <div class="framework-menu" @click=${this.handlers.stopClickPropagation}>
                    <div class="menu-header">
                        <span class="menu-title">Layouts</span>
                        <button class="close-button" @click=${() => this.toggleMenu()}>
                            <svg class="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="menu-items">
                        ${this.menuItems.length > 0
                            ? this.menuItems.map(item => this.renderMenuItem(item))
                            : html`<div class="empty-state">No system layouts available</div>`
                        }
                    </div>
                </div>
            ` : nothing}
        `;
    }
}

customElements.define('framework-menu', FrameworkMenu);
