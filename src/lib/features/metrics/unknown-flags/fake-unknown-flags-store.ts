import type { IUnknownFlagsStore, UnknownFlag } from './unknown-flags-store.js';

export class FakeUnknownFlagsStore implements IUnknownFlagsStore {
    private unknownFlagMap = new Map<string, UnknownFlag>();

    private getKey(flag: UnknownFlag): string {
        return `${flag.name}:${flag.appName}`;
    }

    async replaceAll(flags: UnknownFlag[]): Promise<void> {
        this.unknownFlagMap.clear();
        for (const flag of flags) {
            this.unknownFlagMap.set(this.getKey(flag), flag);
        }
    }

    async getAll(): Promise<UnknownFlag[]> {
        return Array.from(this.unknownFlagMap.values());
    }

    async clear(hoursAgo: number): Promise<void> {
        const cutoff = Date.now() - hoursAgo * 60 * 60 * 1000;
        for (const [key, flag] of this.unknownFlagMap.entries()) {
            if (flag.seenAt.getTime() < cutoff) {
                this.unknownFlagMap.delete(key);
            }
        }
    }

    async deleteAll(): Promise<void> {
        this.unknownFlagMap.clear();
    }

    async count(): Promise<number> {
        return this.unknownFlagMap.size;
    }
}
