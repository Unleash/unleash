import type {
    IUnknownFlagsStore,
    UnknownFlag,
    QueryParams,
} from './unknown-flags-store.js';

export class FakeUnknownFlagsStore implements IUnknownFlagsStore {
    private unknownFlagMap = new Map<string, UnknownFlag>();

    private getKey(flag: UnknownFlag): string {
        return `${flag.name}:${flag.appName}:${flag.environment}`;
    }

    async insert(flags: UnknownFlag[]): Promise<void> {
        this.unknownFlagMap.clear();
        for (const flag of flags) {
            this.unknownFlagMap.set(this.getKey(flag), flag);
        }
    }

    async getAll({ limit, orderBy }: QueryParams = {}): Promise<UnknownFlag[]> {
        const flags = Array.from(this.unknownFlagMap.values());
        if (orderBy) {
            for (const { column, order } of orderBy) {
                flags.sort((a, b) => {
                    if (a[column] < b[column]) return order === 'asc' ? -1 : 1;
                    if (a[column] > b[column]) return order === 'asc' ? 1 : -1;
                    return 0;
                });
            }
        }
        if (!limit) return flags;
        return flags.slice(0, limit);
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
