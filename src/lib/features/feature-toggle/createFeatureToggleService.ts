import {
    AccessService,
    FeatureToggleService,
    GroupService,
} from '../../services';
import FeatureStrategiesStore from './feature-toggle-strategies-store';
import FeatureToggleStore from './feature-toggle-store';
import FeatureToggleClientStore from '../client-feature-toggles/client-feature-toggle-store';
import ProjectStore from '../project/project-store';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store';
import ContextFieldStore from '../../db/context-field-store';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import { AccessStore } from '../../db/access-store';
import RoleStore from '../../db/role-store';
import EnvironmentStore from '../project-environments/environment-store';
import type { Db } from '../../db/db';
import type { IUnleashConfig } from '../../types';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureStrategiesStore from './fakes/fake-feature-strategies-store';
import FakeFeatureToggleStore from './fakes/fake-feature-toggle-store';
import FakeClientFeatureToggleStore from '../client-feature-toggles/fakes/fake-client-feature-toggle-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import FakeContextFieldStore from '../../../test/fixtures/fake-context-field-store';
import FakeGroupStore from '../../../test/fixtures/fake-group-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import FakeAccessStore from '../../../test/fixtures/fake-access-store';
import FakeRoleStore from '../../../test/fixtures/fake-role-store';
import FakeEnvironmentStore from '../project-environments/fake-environment-store';
import {
    createChangeRequestAccessReadModel,
    createFakeChangeRequestAccessService,
} from '../change-request-access-service/createChangeRequestAccessReadModel';
import {
    createFakeSegmentService,
    createSegmentService,
} from '../segment/createSegmentService';
import StrategyStore from '../../db/strategy-store';
import FakeStrategiesStore from '../../../test/fixtures/fake-strategies-store';
import {
    createFakePrivateProjectChecker,
    createPrivateProjectChecker,
} from '../private-project/createPrivateProjectChecker';
import { DependentFeaturesReadModel } from '../dependent-features/dependent-features-read-model';
import { FakeDependentFeaturesReadModel } from '../dependent-features/fake-dependent-features-read-model';
import FeatureTagStore from '../../db/feature-tag-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import {
    createDependentFeaturesService,
    createFakeDependentFeaturesService,
} from '../dependent-features/createDependentFeaturesService';
import {
    createEventsService,
    createFakeEventsService,
} from '../events/createEventsService';
import { EventEmitter } from 'stream';
import { FeatureLifecycleReadModel } from '../feature-lifecycle/feature-lifecycle-read-model';
import { FakeFeatureLifecycleReadModel } from '../feature-lifecycle/fake-feature-lifecycle-read-model';
import { FakeFeatureCollaboratorsReadModel } from './fake-feature-collaborators-read-model';
import { FeatureCollaboratorsReadModel } from './feature-collaborators-read-model';

export const createFeatureToggleService = (
    db: Db,
    config: IUnleashConfig,
): FeatureToggleService => {
    const { getLogger, eventBus, flagResolver, resourceLimits } = config;
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
        getLogger,
        flagResolver,
    );
    const projectStore = new ProjectStore(
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
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
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

    const privateProjectChecker = createPrivateProjectChecker(db, config);

    const dependentFeaturesReadModel = new DependentFeaturesReadModel(db);

    const featureLifecycleReadModel = new FeatureLifecycleReadModel(
        db,
        config.flagResolver,
    );

    const dependentFeaturesService = createDependentFeaturesService(config)(db);

    const featureCollaboratorsReadModel = new FeatureCollaboratorsReadModel(db);

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
        { getLogger, flagResolver, eventBus, resourceLimits },
        segmentService,
        accessService,
        eventService,
        changeRequestAccessReadModel,
        privateProjectChecker,
        dependentFeaturesReadModel,
        dependentFeaturesService,
        featureLifecycleReadModel,
        featureCollaboratorsReadModel,
    );
    return featureToggleService;
};

export const createFakeFeatureToggleService = (config: IUnleashConfig) => {
    const { getLogger, flagResolver, resourceLimits } = config;
    const eventStore = new FakeEventStore();
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
    const fakePrivateProjectChecker = createFakePrivateProjectChecker();
    const dependentFeaturesReadModel = new FakeDependentFeaturesReadModel();
    const dependentFeaturesService = createFakeDependentFeaturesService(config);
    const featureLifecycleReadModel = new FakeFeatureLifecycleReadModel();
    const featureCollaboratorsReadModel =
        new FakeFeatureCollaboratorsReadModel();

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
            resourceLimits,
        },
        segmentService,
        accessService,
        eventService,
        changeRequestAccessReadModel,
        fakePrivateProjectChecker,
        dependentFeaturesReadModel,
        dependentFeaturesService,
        featureLifecycleReadModel,
        featureCollaboratorsReadModel,
    );
    return {
        featureToggleService,
        featureToggleStore,
        projectStore,
        featureStrategiesStore,
    };
};
