import createStores from '../../../../test/fixtures/store';
import EventEmitter from 'events';
import getLogger from '../../../../test/fixtures/no-logger';
import { IUnleashConfig } from '../../../types';
import { LastSeenService } from '../last-seen/last-seen-service';

function initLastSeenService(flagEnabled = true) {
    const stores = createStores();

    const eventBus = new EventEmitter();
    eventBus.emit = jest.fn();

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
            featureToggleStore: stores.featureToggleStore,
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
    const { lastSeenService, featureToggleStore } = initLastSeenService(false);

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
    featureToggleStore.setLastSeen = jest.fn();
    await lastSeenService.store();

    expect(featureToggleStore.setLastSeen).toHaveBeenCalledWith([
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
    lastSeenStore.setLastSeen = jest.fn();
    featureToggleStore.setLastSeen = jest.fn();
    await lastSeenService.store();

    expect(lastSeenStore.setLastSeen).toHaveBeenCalledWith([
        {
            environment: 'development',
            featureName: 'myFeature',
        },
    ]);
    expect(featureToggleStore.setLastSeen).toHaveBeenCalledTimes(0);
});
