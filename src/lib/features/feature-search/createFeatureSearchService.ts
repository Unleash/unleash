import { Db } from '../../db/db';
import { IUnleashConfig } from '../../types';

import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store';
import { FeatureSearchService } from './feature-search-service';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store';

export const createFeatureSearchService =
    (config: IUnleashConfig) => (db: Db): FeatureSearchService => {
        const { getLogger, eventBus, flagResolver } = config;
        const featureStrategiesStore = new FeatureStrategiesStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );

        return new FeatureSearchService(
            { featureStrategiesStore: featureStrategiesStore },
            config,
        );
    };

export const createFakeFeatureSearchService = (
    config: IUnleashConfig,
): FeatureSearchService => {
    const fakeFeatureStrategiesStore = new FakeFeatureStrategiesStore();

    return new FeatureSearchService(
        {
            featureStrategiesStore: fakeFeatureStrategiesStore,
        },
        config,
    );
};
