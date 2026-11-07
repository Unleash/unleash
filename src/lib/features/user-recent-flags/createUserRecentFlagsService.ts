import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import type { FeatureSearchService } from '../feature-search/feature-search-service.js';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import { FakeUserRecentFlagsReadModel } from './fake-user-recent-flags-read-model.js';
import { UserRecentFlagsReadModel } from './user-recent-flags-read-model.js';
import { UserRecentFlagsService } from './user-recent-flags-service.js';

export const createUserRecentFlagsService = (
    db: Db,
    { eventBus }: Pick<IUnleashConfig, 'eventBus'>,
    featureSearchService: FeatureSearchService,
    privateProjectChecker: IPrivateProjectChecker,
) =>
    new UserRecentFlagsService(
        new UserRecentFlagsReadModel(db, eventBus),
        featureSearchService,
        privateProjectChecker,
    );

export const createFakeUserRecentFlagsService = (
    featureSearchService: FeatureSearchService,
    privateProjectChecker: IPrivateProjectChecker,
) =>
    new UserRecentFlagsService(
        new FakeUserRecentFlagsReadModel(),
        featureSearchService,
        privateProjectChecker,
    );
