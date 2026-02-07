export class DockManager {
    private containers = new Set<string>();

    register(containerId: string) {
        this.containers.add(containerId);
    }

    unregister(containerId: string) {
        this.containers.delete(containerId);
    }

    list() {
        return Array.from(this.containers);
    }
}
