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
    FeatureTagService,
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
        },
    );

    return exportImportService;
};
