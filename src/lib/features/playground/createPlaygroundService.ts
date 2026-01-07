import type { Db, IUnleashConfig } from '../../types/index.js';
import { PlaygroundService } from './playground-service.js';
import {
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService.js';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker.js';
import { SegmentReadModel } from '../segment/segment-read-model.js';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model.js';

export const createPlaygroundService = (
    db: Db,
    config: IUnleashConfig,
): PlaygroundService => {
    const segmentReadModel = new SegmentReadModel(db);
    const privateProjectChecker = createPrivateProjectChecker(db, config);
    const featureToggleService = createFeatureToggleService(db, config);

    const playgroundService = new PlaygroundService(
        config,
        {
            featureToggleService,
            privateProjectChecker,
        },
        segmentReadModel,
    );

    return playgroundService;
};

export const createFakePlaygroundService = (config: IUnleashConfig) => {
    const segmentReadModel = new FakeSegmentReadModel();
    const privateProjectChecker = createFakePrivateProjectChecker();
    const featureToggleService =
        createFakeFeatureToggleService(config).featureToggleService;

    const playgroundService = new PlaygroundService(
        config,
        {
            featureToggleService,
            privateProjectChecker,
        },
        segmentReadModel,
    );

    return playgroundService;
};
