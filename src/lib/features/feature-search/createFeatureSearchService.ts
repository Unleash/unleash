import { Db } from '../../db/db';
import { IUnleashConfig } from '../../types';

import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store';
import { FeatureSearchService } from './feature-search-service';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store';
import FeatureSearchStore from '../../../../dist/lib/features/feature-toggle/feature-search-store';
import FakeFeatureSearchStore from './fake-feature-search-store';

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
