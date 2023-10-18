import { Db, IUnleashConfig } from 'lib/server-impl';
import EventStore from '../../db/event-store';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import EnvironmentStore from '../../db/environment-store';
import {
    AccessService,
    EventService,
    FavoritesService,
    GroupService,
    ProjectService,
} from '../../services';
import FakeGroupStore from '../../../test/fixtures/fake-group-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import ProjectStore from '../../db/project-store';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import FeatureTypeStore from '../../db/feature-type-store';
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
import FakeFeatureTypeStore from '../../../test/fixtures/fake-feature-type-store';
import FakeEnvironmentStore from '../../../test/fixtures/fake-environment-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store';
import FakeFavoriteFeaturesStore from '../../../test/fixtures/fake-favorite-features-store';
import FakeFavoriteProjectsStore from '../../../test/fixtures/fake-favorite-projects-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import { LastSeenAtReadModel } from '../../services/client-metrics/last-seen/last-seen-read-model';
import { FakeLastSeenReadModel } from '../../services/client-metrics/last-seen/fake-last-seen-read-model';

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
    const groupStore = new GroupStore(db);
    const featureToggleStore = new FeatureToggleStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featureTypeStore = new FeatureTypeStore(db, getLogger);
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
    const eventService = new EventService(
        {
            eventStore,
            featureTagStore: new FakeFeatureTagStore(),
        },
        config,
    );
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

    const privateProjectChecker = createPrivateProjectChecker(db, config);
    const lastSeenReadModel = new LastSeenAtReadModel(db);

    return new ProjectService(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
            environmentStore,
            featureEnvironmentStore,
            accountStore,
            projectStatsStore,
        },
        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
        eventService,
        privateProjectChecker,
        lastSeenReadModel,
    );
};

export const createFakeProjectService = (
    config: IUnleashConfig,
): ProjectService => {
    const { getLogger } = config;
    const eventStore = new FakeEventStore();
    const projectStore = new FakeProjectStore();
    const groupStore = new FakeGroupStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const featureTypeStore = new FakeFeatureTypeStore();
    const accountStore = new FakeAccountStore();
    const environmentStore = new FakeEnvironmentStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const projectStatsStore = new FakeProjectStatsStore();
    const accessService = createFakeAccessService(config);
    const featureToggleService = createFakeFeatureToggleService(config);
    const favoriteFeaturesStore = new FakeFavoriteFeaturesStore();
    const favoriteProjectsStore = new FakeFavoriteProjectsStore();
    const eventService = new EventService(
        {
            eventStore,
            featureTagStore: new FakeFeatureTagStore(),
        },
        config,
    );
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

    const privateProjectChecker = createFakePrivateProjectChecker();
    const fakeLastSeenReadModel = new FakeLastSeenReadModel();

    return new ProjectService(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
            environmentStore,
            featureEnvironmentStore,
            accountStore,
            projectStatsStore,
        },
        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
        eventService,
        privateProjectChecker,
        fakeLastSeenReadModel,
    );
};
