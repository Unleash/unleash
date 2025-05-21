import type { Logger } from '../../../logger.js';
import type {
    IFlagResolver,
    IUnknownFlagsStore,
    IUnleashConfig,
} from '../../../types/index.js';
import type { IUnleashStores } from '../../../types/index.js';
import type { UnknownFlag } from './unknown-flags-store.js';

export const MAX_UNKNOWN_FLAGS = 10;

export class UnknownFlagsService {
    private logger: Logger;

    private flagResolver: IFlagResolver;

    private unknownFlagsStore: IUnknownFlagsStore;

    private unknownFlagsCache: Map<string, UnknownFlag>;

    constructor(
        { unknownFlagsStore }: Pick<IUnleashStores, 'unknownFlagsStore'>,
        config: IUnleashConfig,
    ) {
        this.unknownFlagsStore = unknownFlagsStore;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger(
            '/features/metrics/unknown-flags/unknown-flags-service.ts',
        );
        this.unknownFlagsCache = new Map<string, UnknownFlag>();
    }

    private getKey(flag: UnknownFlag) {
        return `${flag.name}:${flag.appName}`;
    }

    register(unknownFlags: UnknownFlag[]) {
        for (const flag of unknownFlags) {
            const key = this.getKey(flag);

            if (this.unknownFlagsCache.has(key)) {
                this.unknownFlagsCache.set(key, flag);
                continue;
            }

            if (this.unknownFlagsCache.size >= MAX_UNKNOWN_FLAGS) {
                const oldestKey = [...this.unknownFlagsCache.entries()].sort(
                    (a, b) => a[1].seenAt.getTime() - b[1].seenAt.getTime(),
                )[0][0];
                this.unknownFlagsCache.delete(oldestKey);
            }

            this.unknownFlagsCache.set(key, flag);
        }
    }

    async flush(): Promise<void> {
        if (this.unknownFlagsCache.size === 0) return;

        const existing = await this.unknownFlagsStore.getAll();
        const cached = Array.from(this.unknownFlagsCache.values());

        const merged = [...existing, ...cached];
        const mergedMap = new Map<string, UnknownFlag>();

        for (const flag of merged) {
            const key = this.getKey(flag);
            const existing = mergedMap.get(key);
            if (!existing || flag.seenAt > existing.seenAt) {
                mergedMap.set(key, flag);
            }
        }

        const latest = Array.from(mergedMap.values())
            .sort((a, b) => b.seenAt.getTime() - a.seenAt.getTime())
            .slice(0, MAX_UNKNOWN_FLAGS);

        await this.unknownFlagsStore.replaceAll(latest);
        this.unknownFlagsCache.clear();
    }

    async getGroupedUnknownFlags(): Promise<
        { name: string; reportedBy: { appName: string; seenAt: Date }[] }[]
    > {
        const unknownFlags = await this.unknownFlagsStore.getAll();

        const grouped = new Map<string, { appName: string; seenAt: Date }[]>();

        for (const { name, appName, seenAt } of unknownFlags) {
            if (!grouped.has(name)) {
                grouped.set(name, []);
            }
            grouped.get(name)!.push({ appName, seenAt });
        }

        return Array.from(grouped.entries()).map(([name, reportedBy]) => ({
            name,
            reportedBy,
        }));
    }

    async clear(hoursAgo: number) {
        return this.unknownFlagsStore.clear(hoursAgo);
    }
}
