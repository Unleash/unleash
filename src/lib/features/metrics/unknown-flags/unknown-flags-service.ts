import type {
    IUnknownFlagsStore,
    IUnleashConfig,
} from '../../../types/index.js';
import type { IUnleashStores } from '../../../types/index.js';
import type {
    QueryParams,
    UnknownFlag,
    UnknownFlagReport,
} from './unknown-flags-store.js';

export class UnknownFlagsService {
    private unknownFlagsStore: IUnknownFlagsStore;

    private unknownFlagsCache: Map<string, UnknownFlagReport>;

    constructor(
        { unknownFlagsStore }: Pick<IUnleashStores, 'unknownFlagsStore'>,
        _config: IUnleashConfig,
    ) {
        this.unknownFlagsStore = unknownFlagsStore;
        this.unknownFlagsCache = new Map<string, UnknownFlagReport>();
    }

    private getKey(flag: UnknownFlagReport) {
        return `${flag.name}:${flag.appName}:${flag.environment}`;
    }

    register(unknownFlags: UnknownFlagReport[]) {
        for (const flag of unknownFlags) {
            const key = this.getKey(flag);
            this.unknownFlagsCache.set(key, flag);
        }
    }

    async flush(): Promise<void> {
        if (this.unknownFlagsCache.size === 0) return;

        const cached = Array.from(this.unknownFlagsCache.values());

        cached.sort((a, b) => this.getKey(a).localeCompare(this.getKey(b)));

        await this.unknownFlagsStore.insert(cached);
        this.unknownFlagsCache.clear();
    }

    async getAll(queryParams?: QueryParams): Promise<UnknownFlag[]> {
        return this.unknownFlagsStore.getAll(queryParams);
    }

    async clear(hoursAgo: number) {
        return this.unknownFlagsStore.clear(hoursAgo);
    }
}
