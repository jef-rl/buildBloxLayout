import { LitElement, html, css, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type { ViewInstanceDto } from '../../definitions/dto/view-instance.dto';
import type { CoreContext } from '../../runtime/context/core-context';
import { coreContext } from '../../runtime/context/core-context-key';
import type { UIState } from '../../../types/state';

export class ViewHost extends LitElement {
    private static readonly elementCache = new Map<string, HTMLElement>();

    static getElement(instanceId: string): HTMLElement | undefined {
        return ViewHost.elementCache.get(instanceId);
    }

    static setElement(instanceId: string, element: HTMLElement): void {
        ViewHost.elementCache.set(instanceId, element);
    }
    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
        }

        .host {
            height: 100%;
            width: 100%;
        }
    `;

    @property({ attribute: false }) instances: ViewInstanceDto[] = [];

    @consume({ context: coreContext, subscribe: true })
    core?: CoreContext<UIState>;

    @query('.host') private hostElement?: HTMLDivElement;

    protected updated(): void {
        void this.syncInstances();
    }

    private async syncInstances(): Promise<void> {
        const host = this.hostElement;
        if (!host) {
            return;
        }

        const instances = Array.isArray(this.instances) ? this.instances : [];
        const activeIds = new Set(instances.map((instance) => instance.instanceId));

        Array.from(host.children).forEach((child) => {
            const childElement = child as HTMLElement;
            const instanceId = childElement.dataset.instanceId;
            if (instanceId && !activeIds.has(instanceId)) {
                host.removeChild(childElement);
            }
        });

        for (const instance of instances) {
            const wrapper = this.ensureWrapper(host, instance.instanceId);
            await this.ensureViewElement(wrapper, instance);
        }
    }

    private ensureWrapper(host: HTMLElement, instanceId: string): HTMLElement {
        const existing = host.querySelector<HTMLElement>(`[data-instance-id="${instanceId}"]`);
        if (existing) {
            return existing;
        }
        const wrapper = document.createElement('div');
        wrapper.dataset.instanceId = instanceId;
        wrapper.style.height = '100%';
        wrapper.style.width = '100%';
        host.appendChild(wrapper);
        return wrapper;
    }

    private async ensureViewElement(wrapper: HTMLElement, instance: ViewInstanceDto): Promise<void> {
        const def = this.core?.registries.viewDefs.get(instance.viewId);
        if (!def) {
            wrapper.innerHTML = '';
            return;
        }

        const implKey = def.implKey ?? def.id;
        const impl = this.core?.registries.viewImpls.get(implKey);
        const tagName = def.tagName ?? impl?.tagName;
        if (!tagName) {
            wrapper.innerHTML = '';
            return;
        }

        if (impl?.preload) {
            await impl.preload();
        }

        let element = wrapper.firstElementChild as HTMLElement | null;
        if (!element || element.tagName.toLowerCase() !== tagName.toLowerCase()) {
            wrapper.innerHTML = '';
            element = document.createElement(tagName);
            wrapper.appendChild(element);
        }

        this.applyInstanceData(element, instance, def.defaultSettings ?? {});
    }

    private applyInstanceData(
        element: HTMLElement,
        instance: ViewInstanceDto,
        defaultSettings: Record<string, unknown>,
    ): void {
        (element as { instanceId?: string }).instanceId = instance.instanceId;
        const settings = {
            ...defaultSettings,
            ...(instance.settings ?? {}),
        };
        (element as { settings?: Record<string, unknown> }).settings = settings;
        (element as { layout?: Record<string, unknown> }).layout = instance.layout ?? {};
        (element as { context?: Record<string, unknown> }).context = settings;
        (element as { data?: Record<string, unknown> }).data = settings;
    }

    render() {
        if (!this.instances || this.instances.length === 0) {
            return html`<div class="host">${nothing}</div>`;
        }
        return html`<div class="host"></div>`;
    }
}

customElements.define('view-host', ViewHost);
