/**
 * A bounded, read-through cache with single-flight loading.
 *
 * Entries hold the *promise* of a value rather than the value. That collapses
 * three mechanisms into one: the cache, single-flight, and the window between
 * "query finished" and "value stored" - concurrent misses for the same key find
 * the pending promise and await it, so one query serves all of them.
 *
 * Found and not-found keys are kept in separate maps with separate budgets. The
 * key space for not-found values may be unbounded, so sharing one budget would
 * let a flood of unknown keys evict every found entry.
 *
 * This class deliberately takes no logger and emits no metrics. Callers retain
 * responsibility for observability appropriate to their domain.
 */

type FoundEntry<T> = {
    value: Promise<T | undefined>;
    expiresAt: number;
    /** In-flight entries are never chosen as eviction victims. */
    pending: boolean;
};

type MissEntry = {
    retryAfter: number;
    attempts: number;
};

export type SingleFlightCacheOptions = {
    ttlMs: number;
    ttlMode?: 'absolute' | 'sliding';
    maxSize: number;
    negativeMaxSize: number;
    /**
     * Backoff steps for repeated misses on the same key.
     */
    negativeBackoffMs?: number[];
    /**
     * How long a stale value keeps being served after the loader fails. Mirrors
     * the existing behaviour where a failed refresh keeps serving the last known
     * good set rather than failing every caller during a backing-store blip.
     * Set to 0 to fail closed instead.
     */
    staleWhileErrorMs?: number;
    /** Spreads expiry so entries populated together do not expire together. */
    jitterRatio?: number;
    /** Injectable for tests. */
    now?: () => number;
};

const DEFAULT_BACKOFF_MS = [1_000, 5_000, 30_000, 300_000];

export class SingleFlightCache<T> {
    private readonly found = new Map<string, FoundEntry<T>>();

    private readonly missed = new Map<string, MissEntry>();

    private readonly ttlMs: number;
    private readonly ttlMode: 'absolute' | 'sliding';
    private readonly maxSize: number;
    private readonly negativeMaxSize: number;
    private readonly backoffMs: number[];
    private readonly staleWhileErrorMs: number;
    private readonly jitterRatio: number;
    private readonly now: () => number;

    constructor(options: SingleFlightCacheOptions) {
        this.ttlMs = options.ttlMs;
        this.ttlMode = options.ttlMode ?? 'absolute';
        this.maxSize = options.maxSize;
        this.negativeMaxSize = options.negativeMaxSize;
        this.backoffMs = options.negativeBackoffMs ?? DEFAULT_BACKOFF_MS;
        this.staleWhileErrorMs = options.staleWhileErrorMs ?? 0;
        this.jitterRatio = options.jitterRatio ?? 0;
        this.now = options.now ?? Date.now;
    }

    /**
     * Returns the cached value, joins a lookup already in flight, or runs
     * `load` once. Resolves `undefined` for a key the loader does not find, and
     * for one it recently failed to find - the caller cannot tell the two apart,
     * which is intentional.
     */
    get(
        key: string,
        load: (key: string) => Promise<T | undefined>,
    ): Promise<T | undefined> {
        const now = this.now();

        const hit = this.found.get(key);
        if (hit?.pending) {
            return hit.value;
        }
        if (hit && hit.expiresAt > now) {
            if (this.ttlMode === 'sliding') {
                hit.expiresAt = now + this.jittered(this.ttlMs);
            }
            this.touchFound(key, hit);
            return hit.value;
        }

        const miss = this.missed.get(key);
        if (miss && miss.retryAfter > now) {
            return Promise.resolve(undefined);
        }

        // `hit` here is settled and expired: the value we can fall back on if
        // the loader fails.
        return this.load(key, load, hit);
    }

    /** Populate an entry without invoking its loader. */
    set(key: string, value: T): void {
        this.missed.delete(key);
        this.found.set(key, {
            value: Promise.resolve(value),
            expiresAt: this.now() + this.jittered(this.ttlMs),
            pending: false,
        });
        this.evictFound();
    }

    /** Forget both found and not-found state for a key. */
    delete(key: string): void {
        this.found.delete(key);
        this.missed.delete(key);
    }

    clear(): void {
        this.found.clear();
        this.missed.clear();
    }

    get size(): { found: number; missed: number } {
        return { found: this.found.size, missed: this.missed.size };
    }

    private load(
        key: string,
        load: (key: string) => Promise<T | undefined>,
        stale: FoundEntry<T> | undefined,
    ): Promise<T | undefined> {
        const entry: FoundEntry<T> = {
            pending: true,
            // Placeholder; the real expiry is set once we know what we found.
            expiresAt: Number.POSITIVE_INFINITY,
            value: load(key).then(
                (value) => {
                    entry.pending = false;
                    if (value === undefined) {
                        if (this.found.get(key) === entry) {
                            this.found.delete(key);
                            this.rememberMiss(key);
                        }
                        return undefined;
                    }
                    if (this.found.get(key) === entry) {
                        this.missed.delete(key);
                        entry.expiresAt =
                            this.now() + this.jittered(this.ttlMs);

                        // Evict here, not on insert: a lookup that turns out to be
                        // a miss would otherwise cost a real entry its slot while
                        // it was still in flight.
                        this.evictFound();
                    }
                    return value;
                },
                (error) => {
                    entry.pending = false;
                    if (this.found.get(key) !== entry) {
                        throw error;
                    }
                    this.found.delete(key);

                    // A failure is never cached - the next caller retries.
                    // If we have a previous value, keep serving it for a bounded
                    // window rather than failing auth during a database blip.
                    if (stale && this.staleWhileErrorMs > 0) {
                        stale.expiresAt = this.now() + this.staleWhileErrorMs;
                        this.found.set(key, stale);
                        return stale.value;
                    }
                    throw error;
                },
            ),
        };

        // The stored promise must have a handler or Node reports an unhandled
        // rejection for it. This derived promise is discarded; callers still see
        // the rejection through the one we return.
        entry.value.catch(() => {});

        this.found.set(key, entry);
        return entry.value;
    }

    private rememberMiss(key: string): void {
        const attempts = (this.missed.get(key)?.attempts ?? 0) + 1;
        const step = this.backoffMs[
            Math.min(attempts, this.backoffMs.length) - 1
        ] as number;

        this.missed.set(key, { attempts, retryAfter: this.now() + step });
        this.evictMissed();
    }

    /** Move a settled positive entry to the most-recently-used position. */
    private touchFound(key: string, entry: FoundEntry<T>): void {
        this.found.delete(key);
        this.found.set(key, entry);
    }

    /** LRU. Skips in-flight entries so a burst of misses cannot drop them. */
    private evictFound(): void {
        if (this.found.size <= this.maxSize) {
            return;
        }
        for (const [key, entry] of this.found) {
            if (!entry.pending) {
                this.found.delete(key);
                return;
            }
        }
    }

    private evictMissed(): void {
        if (this.missed.size <= this.negativeMaxSize) {
            return;
        }
        const oldest = this.missed.keys().next();
        if (!oldest.done) {
            this.missed.delete(oldest.value);
        }
    }

    private jittered(ms: number): number {
        const spread = ms * this.jitterRatio;
        return Math.round(ms - spread + Math.random() * spread * 2);
    }
}
