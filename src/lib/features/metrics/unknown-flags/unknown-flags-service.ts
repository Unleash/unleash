import type { Logger } from '../../../logger.js';
import type {
    IFlagResolver,
    IUnknownFlagsStore,
    IUnleashConfig,
} from '../../../types/index.js';
import type { IUnleashStores } from '../../../types/index.js';
import type { QueryParams, UnknownFlag } from './unknown-flags-store.js';

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
        return `${flag.name}:${flag.appName}:${flag.environment}`;
    }

    register(unknownFlags: UnknownFlag[]) {
        if (!this.flagResolver.isEnabled('reportUnknownFlags')) return;
        for (const flag of unknownFlags) {
            const key = this.getKey(flag);
            this.unknownFlagsCache.set(key, flag);
        }
    }

    async flush(): Promise<void> {
        if (!this.flagResolver.isEnabled('reportUnknownFlags')) return;
        if (this.unknownFlagsCache.size === 0) return;

        const cached = Array.from(this.unknownFlagsCache.values());

        cached.sort((a, b) => this.getKey(a).localeCompare(this.getKey(b)));

        await this.unknownFlagsStore.insert(cached);
        this.unknownFlagsCache.clear();
    }

    async getAll(queryParams?: QueryParams): Promise<UnknownFlag[]> {
        if (!this.flagResolver.isEnabled('reportUnknownFlags')) return [];
        return this.unknownFlagsStore.getAll(queryParams);
    }

    async clear(hoursAgo: number) {
        if (!this.flagResolver.isEnabled('reportUnknownFlags')) return;
        return this.unknownFlagsStore.clear(hoursAgo);
    }
}
