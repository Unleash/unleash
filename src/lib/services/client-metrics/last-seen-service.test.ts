import createStores from '../../../test/fixtures/store';
import EventEmitter from 'events';
import getLogger from '../../../test/fixtures/no-logger';
import { IUnleashConfig } from '../../types';
import { LastSeenService } from './last-seen-service';

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

    const lastSeenService = new LastSeenService(stores, config);

    return { lastSeenService, featureToggleStore: stores.featureToggleStore };
}

test('should not add duplicates per feature/environment', async () => {
    const { lastSeenService, featureToggleStore } = initLastSeenService();

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
