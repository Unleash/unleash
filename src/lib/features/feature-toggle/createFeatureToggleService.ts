import {
    AccessService,
    FeatureToggleService,
    GroupService,
} from '../../services/index.js';
import FeatureStrategiesStore from './feature-toggle-strategies-store.js';
import FeatureToggleStore from './feature-toggle-store.js';
import FeatureToggleClientStore from '../client-feature-toggles/client-feature-toggle-store.js';
import ProjectStore from '../project/project-store.js';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store.js';
import ContextFieldStore from '../context/context-field-store.js';
import GroupStore from '../../db/group-store.js';
import { AccountStore } from '../../db/account-store.js';
import { AccessStore } from '../../db/access-store.js';
import RoleStore from '../../db/role-store.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import type { Db } from '../../db/db.js';
import type { IUnleashConfig } from '../../types/index.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import FakeFeatureStrategiesStore from './fakes/fake-feature-strategies-store.js';
import FakeFeatureToggleStore from './fakes/fake-feature-toggle-store.js';
import FakeClientFeatureToggleStore from '../client-feature-toggles/fakes/fake-client-feature-toggle-store.js';
import FakeProjectStore from '../../../test/fixtures/fake-project-store.js';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store.js';
import FakeContextFieldStore from '../context/fake-context-field-store.js';
import FakeGroupStore from '../../../test/fixtures/fake-group-store.js';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store.js';
import FakeAccessStore from '../../../test/fixtures/fake-access-store.js';
import FakeRoleStore from '../../../test/fixtures/fake-role-store.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel.js';
import {
    createFakeSegmentService,
    createSegmentService,
} from '../segment/createSegmentService.js';
import StrategyStore from '../../db/strategy-store.js';
import FakeStrategiesStore from '../../../test/fixtures/fake-strategies-store.js';
import { DependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model.js';
import { FakeDependentFeaturesReadModel } from '../dependent-features/fake-dependent-features-read-model.js';
import FeatureTagStore from '../../db/feature-tag-store.js';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store.js';
import {
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
} from '../dependent-features/createDependentFeaturesService.js';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService.js';
import EventEmitter from 'node:stream';
import { FeatureLifecycleReadModel } from '../feature-lifecycle/feature-lifecycle-read-model.js';
import { FakeFeatureLifecycleReadModel } from '../feature-lifecycle/fake-feature-lifecycle-read-model.js';
import { FakeFeatureCollaboratorsReadModel } from './fake-feature-collaborators-read-model.js';
import { FeatureCollaboratorsReadModel } from './feature-collaborators-read-model.js';
import { FeatureLinksReadModel } from '../feature-links/feature-links-read-model.js';
import { FakeFeatureLinksReadModel } from '../feature-links/fake-feature-links-read-model.js';
import {
    createFakeFeatureLinkService,
    createFeatureLinkService,
} from '../feature-links/createFeatureLinkService.js';
import { ResourceLimitsService } from '../resource-limits/resource-limits-service.js';
import { ReleasePlanMilestoneStrategyStore } from '../release-plans/release-plan-milestone-strategy-store.js';

export const createFeatureToggleService = (
    db: Db,
    config: IUnleashConfig,
): FeatureToggleService => {
    const { getLogger, eventBus, flagResolver } = config;
    const featureStrategiesStore = new FeatureStrategiesStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featureToggleStore = new FeatureToggleStore(
        db,
        eventBus,
        getLogger,
        flagResolver,
    );
    const featureToggleClientStore = new FeatureToggleClientStore(
        db,
        eventBus,
        config,
    );
    const projectStore = new ProjectStore(db, eventBus, config);
    const featureEnvironmentStore = new FeatureEnvironmentStore(
        db,
        eventBus,
        config,
    );
    const contextFieldStore = new ContextFieldStore(
        db,
        getLogger,
        flagResolver,
    );
    const groupStore = new GroupStore(db);
    const strategyStore = new StrategyStore(db, getLogger);
    const accountStore = new AccountStore(db, getLogger);
    const accessStore = new AccessStore(db, eventBus, getLogger);
    const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
    const roleStore = new RoleStore(db, eventBus, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, config);
    const eventService = createEventsService(db, config);
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );
    const accessService = new AccessService(
        { accessStore, accountStore, roleStore, environmentStore },
        { getLogger },
        groupService,
        eventService,
    );
    const segmentService = createSegmentService(db, config);
    const changeRequestAccessReadModel = createChangeRequestAccessReadModel(
        db,
        config,
    );

    const dependentFeaturesReadModel = new DependentFeaturesReadModel(db);

    const featureLifecycleReadModel = new FeatureLifecycleReadModel(db);

    const dependentFeaturesService = createDependentFeaturesService(config)(db);

    const featureCollaboratorsReadModel = new FeatureCollaboratorsReadModel(db);

    const featureLinksReadModel = new FeatureLinksReadModel(db, eventBus);

    const featureLinkService = createFeatureLinkService(config)(db);

    const resourceLimitsService = new ResourceLimitsService(config);

    const releasePlanMilestoneStrategyStore =
        new ReleasePlanMilestoneStrategyStore(db, { eventBus });

    const featureToggleService = new FeatureToggleService(
        {
            featureStrategiesStore,
            featureToggleStore,
            clientFeatureToggleStore: featureToggleClientStore,
            projectStore,
            featureTagStore,
            featureEnvironmentStore,
            contextFieldStore,
            strategyStore,
        },
        { getLogger, flagResolver, eventBus },
        {
            segmentService,
            accessService,
            eventService,
            changeRequestAccessReadModel,
            dependentFeaturesReadModel,
            dependentFeaturesService,
            featureLifecycleReadModel,
            featureCollaboratorsReadModel,
            featureLinksReadModel,
            featureLinkService,
            resourceLimitsService,
            releasePlanMilestoneStrategyStore,
        },
    );
    return featureToggleService;
};

export const createFakeFeatureToggleService = (config: IUnleashConfig) => {
    const { getLogger, flagResolver } = config;
    const _eventStore = new FakeEventStore();
    const strategyStore = new FakeStrategiesStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const featureToggleClientStore = new FakeClientFeatureToggleStore();
    const projectStore = new FakeProjectStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const contextFieldStore = new FakeContextFieldStore();
    const groupStore = new FakeGroupStore();
    const accountStore = new FakeAccountStore();
    const accessStore = new FakeAccessStore();
    const featureTagStore = new FakeFeatureTagStore();
    const roleStore = new FakeRoleStore();
    const environmentStore = new FakeEnvironmentStore();
    const eventService = createFakeEventsService(config);
    const groupService = new GroupService(
        { groupStore, accountStore },
        { getLogger },
        eventService,
    );
    const accessService = new AccessService(
        { accessStore, accountStore, roleStore, environmentStore, groupStore },
        { getLogger },
        groupService,
        eventService,
    );
    const segmentService = createFakeSegmentService(config);
    const changeRequestAccessReadModel = createFakeChangeRequestAccessService();
    const dependentFeaturesReadModel = new FakeDependentFeaturesReadModel();
    const dependentFeaturesService = createFakeDependentFeaturesService(config);
    const featureLifecycleReadModel = new FakeFeatureLifecycleReadModel();
    const featureCollaboratorsReadModel =
        new FakeFeatureCollaboratorsReadModel();
    const featureLinksReadModel = new FakeFeatureLinksReadModel();
    const { featureLinkService } = createFakeFeatureLinkService(config);

    const resourceLimitsService = new ResourceLimitsService(config);

    const featureToggleService = new FeatureToggleService(
        {
            featureStrategiesStore,
            featureToggleStore,
            clientFeatureToggleStore: featureToggleClientStore,
            projectStore,
            featureTagStore,
            featureEnvironmentStore,
            contextFieldStore,
            strategyStore,
        },
        {
            getLogger,
            flagResolver,
            eventBus: new EventEmitter(),
        },
        {
            segmentService,
            accessService,
            eventService,
            changeRequestAccessReadModel,
            dependentFeaturesReadModel,
            dependentFeaturesService,
            featureLifecycleReadModel,
            featureCollaboratorsReadModel,
            featureLinksReadModel,
            featureLinkService,
            resourceLimitsService,
        },
    );
    return {
        featureToggleService,
        featureToggleStore,
        projectStore,
        featureStrategiesStore,
    };
};
