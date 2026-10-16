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
import { PlaygroundReadModel } from './playground-read-model.js';
import { FakePlaygroundReadModel } from './fake-playground-read-model.js';

export const createPlaygroundService = (
    db: Db,
    config: IUnleashConfig,
): PlaygroundService => {
    const segmentReadModel = new SegmentReadModel(db);
    const privateProjectChecker = createPrivateProjectChecker(db, config);
    const featureToggleService = createFeatureToggleService(db, config);
    const playgroundReadModel = new PlaygroundReadModel(db, config.eventBus);

    const playgroundService = new PlaygroundService(
        config,
        {
            featureToggleService,
            privateProjectChecker,
            playgroundReadModel,
        },
        segmentReadModel,
    );

    return playgroundService;
};

export const createFakePlaygroundService = (config: IUnleashConfig) => {
    const segmentReadModel = new FakeSegmentReadModel();
    const privateProjectChecker = createFakePrivateProjectChecker();
    const { featureToggleService, featureToggleStore } =
        createFakeFeatureToggleService(config);
    const playgroundReadModel = new FakePlaygroundReadModel();

    const playgroundService = new PlaygroundService(
        config,
        {
            featureToggleService,
            privateProjectChecker,
            playgroundReadModel,
        },
        segmentReadModel,
    );

    return {
        playgroundService,
        featureToggleStore,
        playgroundReadModel,
        privateProjectChecker,
        segmentReadModel,
    };
};
