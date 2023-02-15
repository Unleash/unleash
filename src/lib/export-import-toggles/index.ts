import { Db } from '../db/db';
import { IUnleashConfig } from '../types';
import ExportImportService from './export-import-service';
import { ImportTogglesStore } from './import-toggles-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import TagStore from '../db/tag-store';
import TagTypeStore from '../db/tag-type-store';
import ProjectStore from '../db/project-store';
import FeatureTagStore from '../db/feature-tag-store';
import StrategyStore from '../db/strategy-store';
import ContextFieldStore from '../db/context-field-store';
import EventStore from '../db/event-store';
import FeatureStrategiesStore from '../db/feature-strategy-store';
import {
    ContextService,
    FeatureTagService,
    StrategyService,
    TagTypeService,
} from '../services';
import { createAccessService } from '../access';
import { createFeatureToggleService } from '../featureToggle';
import SegmentStore from '../db/segment-store';
import { FeatureEnvironmentStore } from '../db/feature-environment-store';

export const createExportImportTogglesService = (
    db: Db,
    config: IUnleashConfig,
): ExportImportService => {
    const { eventBus, getLogger, flagResolver } = config;
    const importTogglesStore = new ImportTogglesStore(db);
    const featureToggleStore = new FeatureToggleStore(db, eventBus, getLogger);
    const tagStore = new TagStore(db, eventBus, getLogger);
    const tagTypeStore = new TagTypeStore(db, eventBus, getLogger);
    const segmentStore = new SegmentStore(db, eventBus, getLogger);
    const projectStore = new ProjectStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
    const strategyStore = new StrategyStore(db, getLogger);
    const contextFieldStore = new ContextFieldStore(db, getLogger);
    const eventStore = new EventStore(db, getLogger);
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
