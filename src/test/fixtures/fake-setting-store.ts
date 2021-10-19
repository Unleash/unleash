import { ISettingStore } from '../../lib/types/stores/settings-store';

export default class FakeSettingStore implements ISettingStore {
    settings: Map<string, any> = new Map();

    async delete(key: string): Promise<void> {
        this.settings.delete(key);
    }

    async deleteAll(): Promise<void> {
        this.settings = new Map();
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.settings.has(key);
    }

    async get(key: string): Promise<any> {
        const setting = this.settings.get(key);
        if (setting) {
            return setting;
        }
        return undefined;
    }

    async getAll(): Promise<any[]> {
        return Array.from(this.settings.values());
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async insert(name: string, content: any): Promise<void> {
        this.settings.set(name, content);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateRow(name: string, content: any): Promise<void> {
        this.settings.set(name, content);
    }
}
