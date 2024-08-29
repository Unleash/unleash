import type { Db, IUnleashConfig } from '../../server-impl';
import EventStore from '../events/event-store';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import EnvironmentStore from '../project-environments/environment-store';
import {
    type AccessService,
    ApiTokenService,
    FavoritesService,
    GroupService,
    ProjectService,
} from '../../services';
import FakeGroupStore from '../../../test/fixtures/fake-group-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import ProjectStore from './project-store';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store';
import ProjectStatsStore from '../../db/project-stats-store';
import {
    createAccessService,
    createFakeAccessService,
} from '../access/createAccessService';
import {
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService';
import { FavoriteFeaturesStore } from '../../db/favorite-features-store';
import { FavoriteProjectsStore } from '../../db/favorite-projects-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store';
import FakeFavoriteFeaturesStore from '../../../test/fixtures/fake-favorite-features-store';
import FakeFavoriteProjectsStore from '../../../test/fixtures/fake-favorite-projects-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker';
import { ProjectOwnersReadModel } from './project-owners-read-model';
import { FakeProjectOwnersReadModel } from './fake-project-owners-read-model';
import { FakeProjectFlagCreatorsReadModel } from './fake-project-flag-creators-read-model';
import { ProjectFlagCreatorsReadModel } from './project-flag-creators-read-model';
import FakeApiTokenStore from '../../../test/fixtures/fake-api-token-store';
import { ApiTokenStore } from '../../db/api-token-store';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import {
    createFakeProjectReadModel,
    createProjectReadModel,
} from './createProjectReadModel';

export const createProjectService = (
    db: Db,
    config: IUnleashConfig,
): ProjectService => {
    const { eventBus, getLogger, flagResolver } = config;
    const eventStore = new EventStore(db, getLogger);
    const projectStore = new ProjectStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
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
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
    const featureEnvironmentStore = new FeatureEnvironmentStore(
        db,
        eventBus,
        getLogger,
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

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );

    const projectReadModel = createProjectReadModel(
        db,
        eventBus,
        config.flagResolver,
    );

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
        },
        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
        eventService,
        privateProjectChecker,
        apiTokenService,
    );
};

export const createFakeProjectService = (
    config: IUnleashConfig,
): ProjectService => {
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

    const apiTokenService = new ApiTokenService(
        { apiTokenStore, environmentStore },
        config,
        eventService,
    );

    const projectReadModel = createFakeProjectReadModel();

    return new ProjectService(
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
        },
        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
        eventService,
        privateProjectChecker,
        apiTokenService,
    );
};
