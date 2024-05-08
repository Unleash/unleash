import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';

import { FeatureSearchService } from './feature-search-service';
import FakeFeatureSearchStore from './fake-feature-search-store';
import FeatureSearchStore from './feature-search-store';

export const createFeatureSearchService =
    (config: IUnleashConfig) =>
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
        );
    };

export const createFakeFeatureSearchService = (
    config: IUnleashConfig,
): FeatureSearchService => {
    const fakeFeatureSearchStore = new FakeFeatureSearchStore();

    return new FeatureSearchService(
        {
            featureSearchStore: fakeFeatureSearchStore,
        },
        config,
    );
};
