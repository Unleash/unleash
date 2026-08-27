import { expect, test, vi } from 'vitest';
import {
    SingleFlightCache,
    type SingleFlightCacheOptions,
} from './single-flight-cache.js';

type Value = { name: string };

let clock = 1_000_000;
const now = () => clock;
const advance = (ms: number) => {
    clock += ms;
};

const makeCache = (overrides: Partial<SingleFlightCacheOptions> = {}) =>
    new SingleFlightCache<Value>({
        ttlMs: 60_000,
        maxSize: 100,
        negativeMaxSize: 50,
        negativeBackoffMs: [1_000, 5_000, 30_000],
        jitterRatio: 0, // deterministic in tests
        now,
        ...overrides,
    });

const found = (name: string) => async () => ({ name });
const notFound = async () => undefined;

test('serves a cached value without hitting the loader again', async () => {
    const cache = makeCache();
    const load = vi.fn(found('a'));

    await cache.get('k', load);
    await cache.get('k', load);
    await cache.get('k', load);

    expect(load).toHaveBeenCalledTimes(1);
});

test('concurrent misses for the same key run the loader once', async () => {
    const cache = makeCache();
    let resolve!: (value: Value) => void;
    const load = vi.fn(() => new Promise<Value>((r) => (resolve = r)));

    const inFlight = [
        cache.get('k', load),
        cache.get('k', load),
        cache.get('k', load),
    ];
    resolve({ name: 'a' });
    const results = await Promise.all(inFlight);

    // Without single-flight this is three queries against a pool of two.
    expect(load).toHaveBeenCalledTimes(1);
    expect(results.map((value) => value?.name)).toEqual(['a', 'a', 'a']);
});

test('reloads once the ttl has passed', async () => {
    const cache = makeCache();
    const load = vi.fn(found('a'));

    await cache.get('k', load);
    advance(60_001);
    await cache.get('k', load);

    expect(load).toHaveBeenCalledTimes(2);
});

test('sliding ttl is refreshed by positive hits', async () => {
    const cache = makeCache({ ttlMode: 'sliding' });
    const load = vi.fn(found('a'));

    await cache.get('k', load);
    advance(50_000);
    await cache.get('k', load);
    advance(50_000);
    await cache.get('k', load);

    expect(load).toHaveBeenCalledTimes(1);

    advance(60_001);
    await cache.get('k', load);
    expect(load).toHaveBeenCalledTimes(2);
});

test('does not re-query a key the loader did not find', async () => {
    const cache = makeCache();
    const load = vi.fn(notFound);

    await expect(cache.get('nope', load)).resolves.toBeUndefined();
    await expect(cache.get('nope', load)).resolves.toBeUndefined();

    expect(load).toHaveBeenCalledTimes(1);
});

test('backs off further on each repeated miss', async () => {
    const cache = makeCache();
    const load = vi.fn(notFound);

    await cache.get('nope', load); // step 1 -> 1s
    advance(1_001);
    await cache.get('nope', load); // step 2 -> 5s
    advance(1_001);
    await cache.get('nope', load); // still inside the 5s window
    expect(load).toHaveBeenCalledTimes(2);

    advance(5_001);
    await cache.get('nope', load); // step 3 -> 30s
    expect(load).toHaveBeenCalledTimes(3);
});

test('a key created moments after being probed is retried quickly', async () => {
    const cache = makeCache();
    const missing = vi.fn(notFound);

    await cache.get('new-key', missing);

    // The value now exists. A flat five-minute negative TTL would continue to
    // hide it even though short initial retries are inexpensive.
    advance(1_001);
    await expect(cache.get('new-key', found('a'))).resolves.toEqual({
        name: 'a',
    });
});

test('never caches a failure', async () => {
    const cache = makeCache();
    const failing = vi.fn(async () => {
        throw new Error('database is down');
    });

    await expect(cache.get('k', failing)).rejects.toThrow('database is down');

    // A rejected promise left in the map would poison this key permanently.
    await expect(cache.get('k', found('a'))).resolves.toEqual({ name: 'a' });
});

test('serves a stale value while the loader is failing', async () => {
    const cache = makeCache({ staleWhileErrorMs: 10_000 });
    await cache.get('k', found('a'));
    advance(60_001); // the entry is now stale

    const failing = async () => {
        throw new Error('database is down');
    };

    // This keeps callers available during a brief backing-store failure.
    await expect(cache.get('k', failing)).resolves.toEqual({ name: 'a' });
});

test('fails closed when there is no stale value to fall back on', async () => {
    const cache = makeCache({ staleWhileErrorMs: 10_000 });
    const failing = async () => {
        throw new Error('database is down');
    };

    await expect(cache.get('k', failing)).rejects.toThrow('database is down');
});

test('a flood of unknown keys cannot evict real entries', async () => {
    const cache = makeCache({ maxSize: 3, negativeMaxSize: 5 });
    await cache.get('real-1', found('1'));
    await cache.get('real-2', found('2'));
    await cache.get('real-3', found('3'));

    for (let i = 0; i < 500; i++) {
        await cache.get(`garbage-${i}`, notFound);
    }

    // Shared budgets would make this cache a DoS amplifier: cheap unknown keys
    // would push out entries actually serving traffic.
    expect(cache.size.found).toBe(3);
    expect(cache.size.missed).toBeLessThanOrEqual(5);

    const load = vi.fn(found('1'));
    await cache.get('real-1', load);
    expect(load).not.toHaveBeenCalled();
});

test('evicts the least recently used found entry once over the cap', async () => {
    const cache = makeCache({ maxSize: 2 });
    await cache.get('a', found('a'));
    await cache.get('b', found('b'));

    const cachedLoad = vi.fn(found('a'));
    await cache.get('a', cachedLoad); // 'a' is now more recent than 'b'
    expect(cachedLoad).not.toHaveBeenCalled();

    await cache.get('c', found('c'));

    expect(cache.size.found).toBe(2);

    const evictedLoad = vi.fn(found('b'));
    await cache.get('b', evictedLoad);
    expect(evictedLoad).toHaveBeenCalledTimes(1); // 'b' was the victim
});

test('does not evict an entry whose lookup is still in flight', async () => {
    const cache = makeCache({ maxSize: 1 });
    let resolve!: (value: Value) => void;
    const pending = cache.get(
        'in-flight',
        () => new Promise<Value>((r) => (resolve = r)),
    );

    await cache.get('other', found('other'));

    resolve({ name: 'in-flight' });
    await expect(pending).resolves.toEqual({ name: 'in-flight' });
});

test('set and delete work without a loader', async () => {
    const cache = makeCache();
    cache.set('k', { name: 'eager' });

    const load = vi.fn(found('from-db'));
    await expect(cache.get('k', load)).resolves.toEqual({ name: 'eager' });
    expect(load).not.toHaveBeenCalled();

    cache.delete('k');
    await cache.get('k', load);
    expect(load).toHaveBeenCalledTimes(1);
});

test('set clears a pending negative entry', async () => {
    const cache = makeCache();
    await cache.get('k', notFound); // negative-cached

    cache.set('k', { name: 'created' });

    await expect(cache.get('k', notFound)).resolves.toEqual({
        name: 'created',
    });
});

test('a pending miss does not overwrite a newer set', async () => {
    const cache = makeCache();
    let resolve!: (value: Value | undefined) => void;
    const pending = cache.get(
        'k',
        () => new Promise<Value | undefined>((r) => (resolve = r)),
    );

    cache.set('k', { name: 'created' });
    resolve(undefined);
    await pending;

    await expect(cache.get('k', notFound)).resolves.toEqual({
        name: 'created',
    });
});

test('a pending value does not overwrite a newer set', async () => {
    const cache = makeCache();
    let resolve!: (value: Value) => void;
    const pending = cache.get(
        'k',
        () => new Promise<Value>((r) => (resolve = r)),
    );

    cache.set('k', { name: 'newer' });
    resolve({ name: 'older' });
    await pending;

    await expect(cache.get('k', notFound)).resolves.toEqual({ name: 'newer' });
});

test('a pending value does not resurrect an explicitly deleted key', async () => {
    const cache = makeCache();
    let resolve!: (value: Value) => void;
    const pending = cache.get(
        'k',
        () => new Promise<Value>((r) => (resolve = r)),
    );

    cache.delete('k');
    resolve({ name: 'deleted' });
    await pending;

    const load = vi.fn(found('reloaded'));
    await expect(cache.get('k', load)).resolves.toEqual({ name: 'reloaded' });
    expect(load).toHaveBeenCalledTimes(1);
});

test('an older failed load does not remove a newer explicit value', async () => {
    const cache = makeCache();
    let reject!: (error: Error) => void;
    const pending = cache.get(
        'k',
        () => new Promise<Value>((_, r) => (reject = r)),
    );

    cache.set('k', { name: 'newer' });
    reject(new Error('database is down'));
    await expect(pending).rejects.toThrow('database is down');

    await expect(cache.get('k', notFound)).resolves.toEqual({ name: 'newer' });
});
