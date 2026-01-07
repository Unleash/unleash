import type { Db, IUnleashConfig } from '../../types/index.js';
import { EventStore } from '../events/event-store.js';
import GroupStore from '../../db/group-store.js';
import { AccountStore } from '../../db/account-store.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import {
    type AccessService,
    ApiTokenService,
    FavoritesService,
    GroupService,
    ProjectService,
    ResourceLimitsService,
} from '../../services/index.js';
import FakeGroupStore from '../../../test/fixtures/fake-group-store.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import ProjectStore from './project-store.js';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store.js';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store.js';
import ProjectStatsStore from '../../db/project-stats-store.js';
import {
    createAccessService,
    createFakeAccessService,
} from '../access/createAccessService.js';
import {
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService.js';
import { FavoriteFeaturesStore } from '../../db/favorite-features-store.js';
import { FavoriteProjectsStore } from '../../db/favorite-projects-store.js';
import FakeProjectStore from '../../../test/fixtures/fake-project-store.js';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store.js';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store.js';
import FakeFavoriteFeaturesStore from '../../../test/fixtures/fake-favorite-features-store.js';
import FakeFavoriteProjectsStore from '../../../test/fixtures/fake-favorite-projects-store.js';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store.js';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker.js';
import { ProjectOwnersReadModel } from './project-owners-read-model.js';
import { FakeProjectOwnersReadModel } from './fake-project-owners-read-model.js';
import { FakeProjectFlagCreatorsReadModel } from './fake-project-flag-creators-read-model.js';
import { ProjectFlagCreatorsReadModel } from './project-flag-creators-read-model.js';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store.js';
import { ApiTokenStore } from '../../db/api-token-store.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import {
    createFakeProjectReadModel,
    createProjectReadModel,
} from './createProjectReadModel.js';
import {
    createFakeOnboardingReadModel,
    createOnboardingReadModel,
} from '../onboarding/createOnboardingReadModel.js';

export const createProjectService = (
    db: Db,
    config: IUnleashConfig,
): ProjectService => {
    const { eventBus, getLogger, flagResolver } = config;
    const eventStore = new EventStore(db, getLogger);
    const projectStore = new ProjectStore(db, eventBus, config);
    const projectOwnersReadModel = new ProjectOwnersReadModel(db);
    const projectFlagCreatorsReadModel = new ProjectFlagCreatorsReadModel(db);
    const groupStore = new GroupStore(db);
    const featureToggleStore = new FeatureToggleStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const accountStore = new AccountStore(db, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, config);
    const featureEnvironmentStore = new FeatureEnvironmentStore(
        db,
        eventBus,
        config,
    );
    const projectStatsStore = new ProjectStatsStore(db, eventBus, getLogger);
    const accessService: AccessService = createAccessService(db, config);
    const featureToggleService = createFeatureToggleService(db, config);
    const favoriteFeaturesStore = new FavoriteFeaturesStore(
        db,
        eventBus,
        getLogger,
    );
    const favoriteProjectsStore = new FavoriteProjectsStore(
        db,
        eventBus,
        getLogger,
    );
    const eventService = createEventsService(db, config);
    const favoriteService = new FavoritesService(
        {
            favoriteFeaturesStore,
            favoriteProjectsStore,
        },
        config,
        eventService,
    );
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );

    const apiTokenStore = new ApiTokenStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );

    const privateProjectChecker = createPrivateProjectChecker(db, config);

    const resourceLimitsService = new ResourceLimitsService(config);

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
        resourceLimitsService,
    );

    const projectReadModel = createProjectReadModel(
        db,
        eventBus,
        config.flagResolver,
    );

    const onboardingReadModel = createOnboardingReadModel(db);

    return new ProjectService(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            environmentStore,
            featureEnvironmentStore,
            accountStore,
            projectStatsStore,
            projectOwnersReadModel,
            projectFlagCreatorsReadModel,
            projectReadModel,
            onboardingReadModel,
        },
        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
        eventService,
        privateProjectChecker,
        apiTokenService,
        resourceLimitsService,
    );
};

export const createFakeProjectService = (config: IUnleashConfig) => {
    const { getLogger } = config;
    const eventStore = new FakeEventStore();
    const projectOwnersReadModel = new FakeProjectOwnersReadModel();
    const projectFlagCreatorsReadModel = new FakeProjectFlagCreatorsReadModel();
    const projectStore = new FakeProjectStore();
    const groupStore = new FakeGroupStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const accountStore = new FakeAccountStore();
    const environmentStore = new FakeEnvironmentStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const projectStatsStore = new FakeProjectStatsStore();
    const { accessService } = createFakeAccessService(config);
    const { featureToggleService } = createFakeFeatureToggleService(config);
    const favoriteFeaturesStore = new FakeFavoriteFeaturesStore();
    const favoriteProjectsStore = new FakeFavoriteProjectsStore();
    const apiTokenStore = new FakeApiTokenStore();
    const privateProjectChecker = createFakePrivateProjectChecker();
    const eventService = createFakeEventsService(config);
    const favoriteService = new FavoritesService(
        {
            favoriteFeaturesStore,
            favoriteProjectsStore,
        },
        config,
        eventService,
    );
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );

    const resourceLimitsService = new ResourceLimitsService(config);

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
        resourceLimitsService,
    );

    const projectReadModel = createFakeProjectReadModel();

    const onboardingReadModel = createFakeOnboardingReadModel();

    const projectService = new ProjectService(
        {
            projectStore,
            projectOwnersReadModel,
            projectFlagCreatorsReadModel,
            eventStore,
            featureToggleStore,
            environmentStore,
            featureEnvironmentStore,
            accountStore,
            projectStatsStore,
            projectReadModel,
            onboardingReadModel,
        },
        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
        eventService,
        privateProjectChecker,
        apiTokenService,
        resourceLimitsService,
    );
    return {
        projectService,
        environmentStore,
        accessService,
        eventService,
        projectStore,
    };
};
