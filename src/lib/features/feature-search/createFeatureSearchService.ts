import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';

import { FeatureSearchService } from './feature-search-service.js';
import FakeFeatureSearchStore from './fake-feature-search-store.js';
import FeatureSearchStore from './feature-search-store.js';
import type { IPrivateProjectChecker } from '../../server-impl.js';

export const createFeatureSearchService =
    (config: IUnleashConfig, privateProjectChecker: IPrivateProjectChecker) =>
    (db: Db): FeatureSearchService => {
        const { getLogger, eventBus, flagResolver } = config;
        const featureSearchStore = new FeatureSearchStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );

        return new FeatureSearchService(
            { featureSearchStore: featureSearchStore },
            config,
            privateProjectChecker,
        );
    };

export const createFakeFeatureSearchService = (
    config: IUnleashConfig,
    privateProjectChecker: IPrivateProjectChecker,
): FeatureSearchService => {
    const fakeFeatureSearchStore = new FakeFeatureSearchStore();

    return new FeatureSearchService(
        {
            featureSearchStore: fakeFeatureSearchStore,
        },
        config,
        privateProjectChecker,
    );
};
