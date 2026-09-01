import { addMinutes, isPast, minutesToMilliseconds } from 'date-fns';
import { SingleFlightCache } from '../../cache/single-flight-cache.js';
import { emitMetricEvent } from '../../metric-events.js';
import type EventEmitter from 'events';
import {
    type IFlagResolver,
    type Logger,
    TOKEN_CACHE_LOOKUP,
} from '../../internals.js';

type TokenLookupResult = 'hit' | 'miss' | 'throttled';

export interface TokenCacheInterface<T> {
    readonly name: string;
    get(
        key: string,
        load: (key: string) => Promise<T | undefined>,
    ): Promise<T | undefined>;
    set(key: string, entry: T): void;
    invalidate(key: string): void;
    /**
     * Replaces all entries in the cache with the provided fresh entries.
     * This is used to refresh the cache with the latest active tokens from the database.
     * To clean up the cache just send an empty array.
     * @param entries
     */
    setEntries(entries: [string, T][]): void;
    usesReadThroughCache(): boolean;
}

class CacheProxy<T> implements TokenCacheInterface<T> {
    constructor(
        readonly name: string,
        private readonly flagResolver: IFlagResolver,
        private cache1: CacheV1<T>,
        private cache2: CacheV2<T>,
    ) {}

    private get activeCache(): TokenCacheInterface<T> {
        return this.flagResolver.isEnabled('usePromiseTokenCache')
            ? this.cache2
            : this.cache1;
    }

    usesReadThroughCache(): boolean {
        return this.activeCache.usesReadThroughCache();
    }

    async get(
        key: string,
        load: (key: string) => Promise<T | undefined>,
    ): Promise<T | undefined> {
        return this.activeCache.get(key, load);
    }
    set(key: string, entry: T): void {
        this.activeCache.set(key, entry);
    }
    invalidate(key: string): void {
        this.activeCache.invalidate(key);
    }
    setEntries(entries: [string, T][]): void {
        // moving this to a client decision, that can be made using `usesReadThroughCache` method
        // this is only a need for the migration period
        this.activeCache.setEntries(entries);
    }
}

class CacheV1<T> implements TokenCacheInterface<T> {
    private activeEntries = new Map<string, T>();
    private queryAfter = new Map<string, Date>();
    private eventBus: EventEmitter;
    private logger: Logger;

    constructor(
        readonly name: string,
        eventBus: EventEmitter,
        logger: Logger,
    ) {
        this.eventBus = eventBus;
        this.logger = logger;
    }

    usesReadThroughCache(): boolean {
        return false;
    }

    async get(
        key: string,
        load: (key: string) => Promise<T | undefined>,
    ): Promise<T | undefined> {
        let token = this.activeEntries.get(key);
        let result: TokenLookupResult = token ? 'hit' : 'miss';
        const nextAllowedQuery = this.queryAfter.get(key) ?? 0;
        if (!token && isPast(nextAllowedQuery)) {
            if (this.queryAfter.size > 1000) {
                this.logger.warn(
                    `${this.name}: negative lookup cache reached 1000 entries and was cleared.`,
                );
                this.queryAfter.clear();
            }
            token = await load(key);
            if (token) {
                this.activeEntries.set(key, token);
            } else {
                this.queryAfter.set(key, addMinutes(new Date(), 5));
            }
        } else if (!token) {
            result = 'throttled';
        }

        emitMetricEvent(this.eventBus, TOKEN_CACHE_LOOKUP, {
            cache: this.name,
            result: result,
        });
        return token;
    }

    set(key: string, entry: T): void {
        this.activeEntries.set(key, entry);
    }

    invalidate(key: string): void {
        this.activeEntries.delete(key);
    }

    setEntries(entries: [string, T][]): void {
        this.activeEntries = new Map(entries);
    }
}

class CacheV2<T> implements TokenCacheInterface<T> {
    private singleFlightCache = new SingleFlightCache<T>({
        ttlMs: minutesToMilliseconds(10),
        ttlMode: 'sliding',
        maxSize: 10_000,
        negativeMaxSize: 1_000,
        negativeBackoffMs: [1_000, 5_000, 30_000, minutesToMilliseconds(5)], // like old 5' throttle
        staleWhileErrorMs: minutesToMilliseconds(1),
    });

    constructor(
        readonly name: string,
        private eventBus: EventEmitter,
    ) {}

    usesReadThroughCache(): boolean {
        return true;
    }

    async get(
        key: string,
        load: (key: string) => Promise<T | undefined>,
    ): Promise<T | undefined> {
        let queried = false;

        const entry = await this.singleFlightCache.get(key, async (key) => {
            queried = true;
            return load(key);
        });

        emitMetricEvent(this.eventBus, TOKEN_CACHE_LOOKUP, {
            cache: this.name,
            result: queried ? 'miss' : entry ? 'hit' : 'throttled',
        });
        return entry;
    }

    set(key: string, entry: T): void {
        this.singleFlightCache.set(key, entry);
    }

    invalidate(key: string): void {
        this.singleFlightCache.delete(key);
    }

    setEntries(entries: [string, T][]): void {
        this.singleFlightCache.clear();
        for (const [key, entry] of entries) {
            this.singleFlightCache.set(key, entry);
        }
    }
}

type TokenCacheDependencies = {
    flagResolver: IFlagResolver;
    eventBus: EventEmitter;
    logger: Logger;
};

export const createTokenCache = <T>(
    name: string,
    { flagResolver, eventBus, logger }: TokenCacheDependencies,
): TokenCacheInterface<T> =>
    new CacheProxy<T>(
        `${name}-proxy`,
        flagResolver,
        new CacheV1<T>(`${name}-v1`, eventBus, logger),
        new CacheV2<T>(`${name}-v2`, eventBus),
    );
