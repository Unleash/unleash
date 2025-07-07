import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import ExportImportService from './export-import-service.js';
import { ImportTogglesStore } from './import-toggles-store.js';
import FeatureToggleStore from '../feature-toggle/feature-toggle-store.js';
import TagStore from '../../db/tag-store.js';
import TagTypeStore from '../tag-type/tag-type-store.js';
import FeatureTagStore from '../../db/feature-tag-store.js';
import StrategyStore from '../../db/strategy-store.js';
import ContextFieldStore from '../context/context-field-store.js';
import FeatureStrategiesStore from '../feature-toggle/feature-toggle-strategies-store.js';
import {
    FeatureTagService,
    StrategyService,
    TagTypeService,
} from '../../services/index.js';
import {
    createAccessService,
    createFakeAccessService,
} from '../access/createAccessService.js';
import {
    createFakeFeatureToggleService,
    createFeatureToggleService,
} from '../feature-toggle/createFeatureToggleService.js';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store.js';
import FakeFeatureToggleStore from '../feature-toggle/fakes/fake-feature-toggle-store.js';
import FakeTagStore from '../../../test/fixtures/fake-tag-store.js';
import FakeTagTypeStore from '../tag-type/fake-tag-type-store.js';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store.js';
import FakeContextFieldStore from '../context/fake-context-field-store.js';
import FakeFeatureStrategiesStore from '../feature-toggle/fakes/fake-feature-strategies-store.js';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store.js';
import FakeStrategiesStore from '../../../test/fixtures/fake-strategies-store.js';
import { createPrivateProjectChecker } from '../private-project/createPrivateProjectChecker.js';
import type { DeferredServiceFactory } from '../../db/transaction.js';
import { DependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model.js';
import { FakeDependentFeaturesReadModel } from '../dependent-features/fake-dependent-features-read-model.js';
import {
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
} from '../dependent-features/createDependentFeaturesService.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import { SegmentReadModel } from '../segment/segment-read-model.js';
import { FakeSegmentReadModel } from '../segment/fake-segment-read-model.js';
import {
    createContextService,
    createFakeContextService,
} from '../context/createContextService.js';
import { FakeFeatureLinksReadModel } from '../feature-links/fake-feature-links-read-model.js';
import { FeatureLinksReadModel } from '../feature-links/feature-links-read-model.js';
import {
    createFakeFeatureLinkService,
    createFeatureLinkService,
} from '../feature-links/createFeatureLinkService.js';

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

    const featureLinksReadModel = new FakeFeatureLinksReadModel();

    const featureLinkService =
        createFakeFeatureLinkService(config).featureLinkService;

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
            featureLinkService,
        },
        dependentFeaturesReadModel,
        segmentReadModel,
        featureLinksReadModel,
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

        const featureLinksReadModel = new FeatureLinksReadModel(db, eventBus);

        const featureLinkService = createFeatureLinkService(config)(db);

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
                featureLinkService,
            },
            dependentFeaturesReadModel,
            segmentReadModel,
            featureLinksReadModel,
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
