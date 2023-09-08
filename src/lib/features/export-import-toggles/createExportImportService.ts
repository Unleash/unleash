import { Db } from '../../db/db';
import { IUnleashConfig } from '../../types';
import ExportImportService from './export-import-service';
import { ImportTogglesStore } from './import-toggles-store';
import FeatureToggleStore from '../../db/feature-toggle-store';
import TagStore from '../../db/tag-store';
import TagTypeStore from '../../db/tag-type-store';
import ProjectStore from '../../db/project-store';
import FeatureTagStore from '../../db/feature-tag-store';
import StrategyStore from '../../db/strategy-store';
import ContextFieldStore from '../../db/context-field-store';
import FeatureStrategiesStore from '../../db/feature-strategy-store';
import {
    ContextService,
    FavoritesService,
    FeatureTagService,
    GroupService,
    ProjectService,
    StrategyService,
    TagTypeService,
} from '../../services';
import {
    createAccessService,
    createFakeAccessService,
} from '../access/createAccessService';
import {
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService';
import SegmentStore from '../../db/segment-store';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store';
import FeatureTypeStore from '../../db/feature-type-store';
import EnvironmentStore from '../../db/environment-store';
import { AccountStore } from '../../db/account-store';
import ProjectStatsStore from '../../db/project-stats-store';
import GroupStore from '../../db/group-store';
import { FavoriteFeaturesStore } from '../../db/favorite-features-store';
import { FavoriteProjectsStore } from '../../db/favorite-projects-store';
import FakeFeatureToggleStore from '../../../test/fixtures/fake-feature-toggle-store';
import FakeTagStore from '../../../test/fixtures/fake-tag-store';
import FakeTagTypeStore from '../../../test/fixtures/fake-tag-type-store';
import FakeSegmentStore from '../../../test/fixtures/fake-segment-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import FakeContextFieldStore from '../../../test/fixtures/fake-context-field-store';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureStrategiesStore from '../../../test/fixtures/fake-feature-strategies-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import FakeStrategiesStore from '../../../test/fixtures/fake-strategies-store';
import EventStore from '../../db/event-store';
import FakeFeatureTypeStore from '../../../test/fixtures/fake-feature-type-store';
import FakeEnvironmentStore from '../../../test/fixtures/fake-environment-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import FakeProjectStatsStore from '../../../test/fixtures/fake-project-stats-store';
import FakeGroupStore from '../../../test/fixtures/fake-group-store';
import FakeFavoriteFeaturesStore from '../../../test/fixtures/fake-favorite-features-store';
import FakeFavoriteProjectsStore from '../../../test/fixtures/fake-favorite-projects-store';

export const createFakeExportImportTogglesService = (
    config: IUnleashConfig,
): ExportImportService => {
    const { getLogger } = config;
    const importTogglesStore = {} as ImportTogglesStore;
    const featureToggleStore = new FakeFeatureToggleStore();
    const tagStore = new FakeTagStore();
    const tagTypeStore = new FakeTagTypeStore();
    const segmentStore = new FakeSegmentStore();
    const projectStore = new FakeProjectStore();
    const featureTagStore = new FakeFeatureTagStore();
    const strategyStore = new FakeStrategiesStore();
    const contextFieldStore = new FakeContextFieldStore();
    const eventStore = new FakeEventStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const featureTypeStore = new FakeFeatureTypeStore();
    const environmentStore = new FakeEnvironmentStore();
    const accountStore = new FakeAccountStore();
    const projectStatsStore = new FakeProjectStatsStore();
    const groupStore = new FakeGroupStore();
    const favoriteFeaturesStore = new FakeFavoriteFeaturesStore();
    const favoriteProjectsStore = new FakeFavoriteProjectsStore();
    const accessService = createFakeAccessService(config);
    const featureToggleService = createFakeFeatureToggleService(config);

    const featureTagService = new FeatureTagService(
        {
            tagStore,
            featureTagStore,
            eventStore,
            featureToggleStore,
        },
        { getLogger },
    );
    const contextService = new ContextService(
        {
            projectStore,
            eventStore,
            contextFieldStore,
            featureStrategiesStore,
        },
        { getLogger },
    );
    const strategyService = new StrategyService(
        { strategyStore, eventStore },
        { getLogger },
    );
    const tagTypeService = new TagTypeService(
        { tagTypeStore, eventStore },
        { getLogger },
    );

    const groupService = new GroupService(
        {
            groupStore,
            eventStore,
            accountStore,
        },
        { getLogger },
    );

    const favoriteService = new FavoritesService(
        {
            eventStore,
            favoriteFeaturesStore,
            favoriteProjectsStore,
        },
        config,
    );

    const projectService = new ProjectService(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
            environmentStore,
            featureEnvironmentStore,
            featureTagStore,
            accountStore,
            projectStatsStore,
        },

        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
    );

    const exportImportService = new ExportImportService(
        {
            eventStore,
            importTogglesStore,
            featureStrategiesStore,
            contextFieldStore,
            featureToggleStore,
            featureTagStore,
            segmentStore,
            tagTypeStore,
            featureEnvironmentStore,
        },
        config,
        {
            featureToggleService,
            featureTagService,
            accessService,
            contextService,
            strategyService,
            tagTypeService,
            projectService,
        },
    );

    return exportImportService;
};

export const createExportImportTogglesService = (
    db: Db,
    config: IUnleashConfig,
): ExportImportService => {
    const { eventBus, getLogger, flagResolver } = config;
    const importTogglesStore = new ImportTogglesStore(db);
    const featureToggleStore = new FeatureToggleStore(db, eventBus, getLogger);
    const tagStore = new TagStore(db, eventBus, getLogger);
    const tagTypeStore = new TagTypeStore(db, eventBus, getLogger);
    const segmentStore = new SegmentStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const projectStore = new ProjectStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
    const strategyStore = new StrategyStore(db, getLogger);
    const contextFieldStore = new ContextFieldStore(
        db,
        getLogger,
        flagResolver,
    );
    const featureStrategiesStore = new FeatureStrategiesStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featureEnvironmentStore = new FeatureEnvironmentStore(
        db,
        eventBus,
        getLogger,
    );
    const eventStore = new EventStore(db, getLogger);
    const featureTypeStore = new FeatureTypeStore(db, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
    const accountStore = new AccountStore(db, getLogger);
    const projectStatsStore = new ProjectStatsStore(db, eventBus, getLogger);
    const groupStore = new GroupStore(db);
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
    const accessService = createAccessService(db, config);
    const featureToggleService = createFeatureToggleService(db, config);

    const featureTagService = new FeatureTagService(
        {
            tagStore,
            featureTagStore,
            eventStore,
            featureToggleStore,
        },
        { getLogger },
    );
    const contextService = new ContextService(
        {
            projectStore,
            eventStore,
            contextFieldStore,
            featureStrategiesStore,
        },
        { getLogger },
    );
    const strategyService = new StrategyService(
        { strategyStore, eventStore },
        { getLogger },
    );
    const tagTypeService = new TagTypeService(
        { tagTypeStore, eventStore },
        { getLogger },
    );

    const groupService = new GroupService(
        {
            groupStore,
            eventStore,
            accountStore,
        },
        { getLogger },
    );

    const favoriteService = new FavoritesService(
        {
            eventStore,
            favoriteFeaturesStore,
            favoriteProjectsStore,
        },
        config,
    );

    const projectService = new ProjectService(
        {
            projectStore,
            eventStore,
            featureToggleStore,
            featureTypeStore,
            environmentStore,
            featureEnvironmentStore,
            featureTagStore,
            accountStore,
            projectStatsStore,
        },

        config,
        accessService,
        featureToggleService,
        groupService,
        favoriteService,
    );

    const exportImportService = new ExportImportService(
        {
            eventStore,
            importTogglesStore,
            featureStrategiesStore,
            contextFieldStore,
            featureToggleStore,
            featureTagStore,
            segmentStore,
            tagTypeStore,
            featureEnvironmentStore,
        },
        config,
        {
            featureToggleService,
            featureTagService,
            accessService,
            contextService,
            strategyService,
            tagTypeService,
            projectService,
        },
    );

    return exportImportService;
};
