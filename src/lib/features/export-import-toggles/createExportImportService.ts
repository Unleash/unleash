import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import ExportImportService from './export-import-service';
import { ImportTogglesStore } from './import-toggles-store';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store';
import TagStore from '../../db/tag-store';
import TagTypeStore from '../tag-type/tag-type-store';
import FeatureTagStore from '../../db/feature-tag-store';
import StrategyStore from '../../db/strategy-store';
import ContextFieldStore from '../context/context-field-store';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store';
import {
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
import { FeatureEnvironmentStore } from '../../db/feature-environment-store';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store';
import FakeTagStore from '../../../test/fixtures/fake-tag-store';
import FakeTagTypeStore from '../tag-type/fake-tag-type-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import FakeContextFieldStore from '../context/fake-context-field-store';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import FakeStrategiesStore from '../../../test/fixtures/fake-strategies-store';
import { createPrivateProjectChecker } from '../private-project/createPrivateProjectChecker';
import type { DeferredServiceFactory } from '../../db/transaction';
import { DependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model';
import { FakeDependentFeaturesReadModel } from '../dependent-features/fake-dependent-features-read-model';
import {
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
} from '../dependent-features/createDependentFeaturesService';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import { SegmentReadModel } from '../segment/segment-read-model';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model';
import {
    createContextService,
    createFakeContextService,
} from '../context/createContextService';

export const createFakeExportImportTogglesService = (
    config: IUnleashConfig,
): ExportImportService => {
    const { getLogger } = config;
    const importTogglesStore = {} as ImportTogglesStore;
    const featureToggleStore = new FakeFeatureToggleStore();
    const tagStore = new FakeTagStore();
    const tagTypeStore = new FakeTagTypeStore();
    const featureTagStore = new FakeFeatureTagStore();
    const strategyStore = new FakeStrategiesStore();
    const contextFieldStore = new FakeContextFieldStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const { accessService } = createFakeAccessService(config);
    const { featureToggleService } = createFakeFeatureToggleService(config);

    const eventService = createFakeEventsService(config);

    const featureTagService = new FeatureTagService(
        {
            tagStore,
            featureTagStore,
            featureToggleStore,
        },
        { getLogger },
        eventService,
    );
    const contextService = createFakeContextService(config);
    const strategyService = new StrategyService(
        { strategyStore },
        { getLogger },
        eventService,
    );
    const tagTypeService = new TagTypeService(
        { tagTypeStore },
        { getLogger },
        eventService,
    );
    const dependentFeaturesReadModel = new FakeDependentFeaturesReadModel();

    const segmentReadModel = new FakeSegmentReadModel();

    const dependentFeaturesService = createFakeDependentFeaturesService(config);

    return new ExportImportService(
        {
            importTogglesStore,
            featureStrategiesStore,
            contextFieldStore,
            featureToggleStore,
            featureTagStore,
            tagTypeStore,
            featureEnvironmentStore,
        },
        config,
        {
            featureToggleService,
            featureTagService,
            accessService,
            eventService,
            contextService,
            strategyService,
            tagTypeService,
            dependentFeaturesService,
        },
        dependentFeaturesReadModel,
        segmentReadModel,
    );
};

export const deferredExportImportTogglesService = (
    config: IUnleashConfig,
): DeferredServiceFactory<ExportImportService> => {
    return (db: Db) => {
        const { eventBus, getLogger, flagResolver } = config;
        const importTogglesStore = new ImportTogglesStore(db);
        const featureToggleStore = new FeatureToggleStore(
            db,
            eventBus,
            getLogger,
            flagResolver,
        );
        const tagStore = new TagStore(db, eventBus, getLogger);
        const tagTypeStore = new TagTypeStore(db, eventBus, getLogger);
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
            config,
        );
        const accessService = createAccessService(db, config);
        const featureToggleService = createFeatureToggleService(db, config);
        createPrivateProjectChecker(db, config);
        const eventService = createEventsService(db, config);

        const featureTagService = new FeatureTagService(
            {
                tagStore,
                featureTagStore,
                featureToggleStore,
            },
            { getLogger },
            eventService,
        );
        const contextService = createContextService(config)(db);
        const strategyService = new StrategyService(
            { strategyStore },
            { getLogger },
            eventService,
        );
        const tagTypeService = new TagTypeService(
            { tagTypeStore },
            { getLogger },
            eventService,
        );
        const dependentFeaturesReadModel = new DependentFeaturesReadModel(db);

        const segmentReadModel = new SegmentReadModel(db);

        const dependentFeaturesService =
            createDependentFeaturesService(config)(db);

        return new ExportImportService(
            {
                importTogglesStore,
                featureStrategiesStore,
                contextFieldStore,
                featureToggleStore,
                featureTagStore,
                tagTypeStore,
                featureEnvironmentStore,
            },
            config,
            {
                featureToggleService,
                featureTagService,
                accessService,
                eventService,
                contextService,
                strategyService,
                tagTypeService,
                dependentFeaturesService,
            },
            dependentFeaturesReadModel,
            segmentReadModel,
        );
    };
};
export const createExportImportTogglesService = (
    db: Db,
    config: IUnleashConfig,
): ExportImportService => {
    const unboundService = deferredExportImportTogglesService(config);
    return unboundService(db);
};
