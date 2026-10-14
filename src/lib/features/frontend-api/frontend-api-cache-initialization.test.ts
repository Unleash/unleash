import assert from 'node:assert/strict';
import { once } from 'node:events';
import { afterEach, test } from 'vitest';
import ConfigurationRevisionService, {
    UPDATE_REVISION,
} from '../feature-toggle/configuration-revision-service.js';
import { GlobalFrontendApiCache } from './global-frontend-api-cache.js';
import type { IEventStore, IUnleashConfig } from '../../types/index.js';
import type { IClientFeatureToggleReadModel } from './client-feature-toggle-read-model-type.js';
import type { ISegmentReadModel } from '../../types/index.js';
import noLogger from '../../../test/fixtures/no-logger.js';

let service: ConfigurationRevisionService;
afterEach(() => service?.destroy());

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
        resolve = res;
    });
    return { promise, resolve };
}

function setup(readRevision: () => Promise<number>) {
    const config = {
        getLogger: noLogger,
        flagResolver: { isEnabled: () => false },
    } as unknown as IUnleashConfig;
    service = ConfigurationRevisionService.getInstance(
        { eventStore: { getMaxRevisionId: readRevision } as IEventStore },
        config,
    );
    let loads = 0;
    const cache = new GlobalFrontendApiCache(
        config,
        { getAll: async () => [] } as unknown as ISegmentReadModel,
        {
            getAll: async () => {
                loads++;
                return {};
            },
        } as unknown as IClientFeatureToggleReadModel,
        service,
    );
    return { cache, loads: () => loads };
}

test('unchanged first poll does not reload the cache; a real change does', async () => {
    let revision = 42;
    const { cache, loads } = setup(async () => revision);
    await cache.readyPromise;
    assert.equal(loads(), 1);
    await service.updateMaxRevisionId();
    assert.equal(loads(), 1);

    const updated = once(cache, 'updated');
    revision = 43;
    await service.updateMaxRevisionId();
    await updated;
    assert.equal(loads(), 2);
});

test('cache and concurrent initialization callers share the pending baseline', async () => {
    const baseline = deferred<number>();
    let reads = 0;
    const { cache, loads } = setup(() => {
        reads++;
        return baseline.promise;
    });
    const first = service.initialize();
    assert.equal(first, service.initialize());
    assert.equal(reads, 1);
    assert.equal(loads(), 0);
    baseline.resolve(42);
    await Promise.all([first, cache.readyPromise]);
    assert.equal(loads(), 1);
    await service.initialize();
    assert.equal(reads, 1);
});

test('polling waits for initialization and announces changes committed meanwhile', async () => {
    const baseline = deferred<number>();
    let reads = 0;
    const revisions: number[] = [];
    const { cache } = setup(() => {
        reads++;
        return reads === 1 ? baseline.promise : Promise.resolve(43);
    });
    service.on(UPDATE_REVISION, (revision) => revisions.push(revision));
    const polling = service.updateMaxRevisionId();
    await Promise.resolve();
    assert.equal(reads, 1);
    assert.deepEqual(revisions, []);

    baseline.resolve(42);
    await Promise.all([cache.readyPromise, polling]);
    assert.equal(reads, 2);
    assert.deepEqual(revisions, [43]);
});

test('failed baseline initialization can be retried by the cache', async () => {
    let reads = 0;
    const { cache, loads } = setup(async () => {
        reads++;
        if (reads === 1) {
            throw new Error('database temporarily unavailable');
        }
        return 42;
    });
    await cache.readyPromise;
    assert.equal(cache.isReady(), false);
    assert.equal(loads(), 0);
    await cache.refreshData();
    assert.equal(cache.isReady(), true);
    assert.equal(reads, 2);
    assert.equal(loads(), 1);
});

test('zero is a valid initialized baseline', async () => {
    let reads = 0;
    const { cache } = setup(async () => {
        reads++;
        return 0;
    });
    await cache.readyPromise;
    await service.initialize();
    assert.equal(reads, 1);
    const revisions: number[] = [];
    service.on(UPDATE_REVISION, (revision) => revisions.push(revision));
    await service.updateMaxRevisionId();
    assert.deepEqual(revisions, []);
});
