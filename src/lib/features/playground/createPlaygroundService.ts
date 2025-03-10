import type { Db, IUnleashConfig } from '../../server-impl';
import { PlaygroundService } from './playground-service';
import {
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker';
import { SegmentReadModel } from '../segment/segment-read-model';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model';

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
