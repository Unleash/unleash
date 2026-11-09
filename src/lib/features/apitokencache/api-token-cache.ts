import { minutesToMilliseconds } from 'date-fns';
import { SingleFlightCache } from '../../cache/single-flight-cache.js';
import { emitMetricEvent } from '../../metric-events.js';
import type EventEmitter from 'events';
import { type IUnleashConfig, TOKEN_CACHE_LOOKUP } from '../../internals.js';

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
}

/**
 * Thin wrapper over single-flight cache with events for token caching
 * and it also adds a predefined configuration for the token cache
 */
class TokenCache<T> implements TokenCacheInterface<T> {
    private singleFlightCache = new SingleFlightCache<T>({
        ttlMs: minutesToMilliseconds(10),
        ttlMode: 'sliding',
        maxSize: 10_000,
        negativeMaxSize: 1_000,
        negativeBackoffMs: [
            minutesToMilliseconds(5),
            minutesToMilliseconds(15),
            minutesToMilliseconds(30),
        ],
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

    set(key: string, entry: T): void {
        this.singleFlightCache.set(key, entry);
    }

    invalidate(key: string): void {
        this.singleFlightCache.delete(key);
    }

    setEntries(entries: [string, T][]): void {
        this.singleFlightCache.setEntries(entries);
    }
}

export const createTokenCache = <T>(
    name: string,
    { eventBus }: Pick<IUnleashConfig, 'eventBus'>,
): TokenCacheInterface<T> => new TokenCache<T>(`${name}-v2`, eventBus);
