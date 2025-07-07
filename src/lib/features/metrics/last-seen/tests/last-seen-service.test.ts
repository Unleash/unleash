import createStores from '../../../../../test/fixtures/store.js';
import EventEmitter from 'events';
import getLogger from '../../../../../test/fixtures/no-logger.js';
import type { IUnleashConfig } from '../../../../types/index.js';
import { type LastSeenInput, LastSeenService } from '../last-seen-service.js';
import { vi } from 'vitest';

function initLastSeenService(flagEnabled = true) {
    const stores = createStores();

    const eventBus = new EventEmitter();
    eventBus.emit = vi.fn() as () => boolean;

    const config = {
        eventBus,
        getLogger,
        flagResolver: {
            isEnabled: () => {
                return flagEnabled;
            },
        },
    } as unknown as IUnleashConfig;

    const lastSeenService = new LastSeenService(
        {
            lastSeenStore: stores.lastSeenStore,
        },
        config,
    );

    return {
        lastSeenService,
        featureToggleStore: stores.featureToggleStore,
        lastSeenStore: stores.lastSeenStore,
    };
}

test('should not add duplicates per feature/environment', async () => {
    const { lastSeenService, featureToggleStore, lastSeenStore } =
        initLastSeenService(false);
    const lastSeenSpy = vi.spyOn(lastSeenStore, 'setLastSeen');

    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);

    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);
    await lastSeenService.store();
    expect(lastSeenSpy).toHaveBeenCalledWith([
        {
            environment: 'development',
            featureName: 'myFeature',
        },
    ]);
});

test('should call last seen at store with correct data', async () => {
    const { lastSeenService, lastSeenStore, featureToggleStore } =
        initLastSeenService(true);

    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);

    lastSeenService.updateLastSeen([
        {
            featureName: 'myFeature',
            environment: 'development',
            yes: 1,
            no: 0,
            appName: 'test',
            timestamp: new Date(),
        },
    ]);
    lastSeenStore.setLastSeen = vi.fn() as (
        data: LastSeenInput[],
    ) => Promise<void>;
    await lastSeenService.store();

    expect(lastSeenStore.setLastSeen).toHaveBeenCalledWith([
        {
            environment: 'development',
            featureName: 'myFeature',
        },
    ]);
});
