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
    set(key: string, entry: T): Promise<void>;
    invalidate(key: string): Promise<void>;
    /**
     * Replaces all entries in the cache with the provided fresh entries.
     * This is used to refresh the cache with the latest active tokens from the database.
     * To clean up the cache just send an empty array.
     * @param entries
     */
    setEntries(entries: [string, T][]): Promise<void>;
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

    async get(
        key: string,
        load: (key: string) => Promise<T | undefined>,
    ): Promise<T | undefined> {
        return this.activeCache.get(key, load);
    }
    async set(key: string, entry: T): Promise<void> {
        return this.activeCache.set(key, entry);
    }
    async invalidate(key: string): Promise<void> {
        return this.activeCache.invalidate(key);
    }
    async setEntries(entries: [string, T][]): Promise<void> {
        // only keeps cache 1 updated, cache 2 will be updated on next get() call
        // with the read through
        return this.cache1.setEntries(entries);
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

    async set(key: string, entry: T): Promise<void> {
        this.activeEntries.set(key, entry);
    }

    async invalidate(key: string): Promise<void> {
        this.activeEntries.delete(key);
        // temporarily throttle negative lookups for 5 minutes to avoid hammering the database with repeated queries for the same missing token
        this.queryAfter.set(key, addMinutes(new Date(), 5));
    }

    async setEntries(entries: [string, T][]): Promise<void> {
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
    async set(key: string, entry: T): Promise<void> {
        this.singleFlightCache.set(key, entry);
    }

    async invalidate(key: string): Promise<void> {
        this.singleFlightCache.delete(key);
    }

    async setEntries(entries: [string, T][]): Promise<void> {
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
