import {
    AccessService,
    FeatureToggleService,
    GroupService,
} from '../../services';
import FeatureStrategiesStore from '../../db/feature-strategy-store';
import FeatureToggleStore from '../../db/feature-toggle-store';
import FeatureToggleClientStore from '../../db/feature-toggle-client-store';
import ProjectStore from '../../db/project-store';
import FeatureTagStore from '../../db/feature-tag-store';
import { FeatureEnvironmentStore } from '../../db/feature-environment-store';
import ContextFieldStore from '../../db/context-field-store';
import GroupStore from '../../db/group-store';
import { AccountStore } from '../../db/account-store';
import { AccessStore } from '../../db/access-store';
import RoleStore from '../../db/role-store';
import EnvironmentStore from '../../db/environment-store';
import { Db } from '../../db/db';
import { IUnleashConfig } from '../../types';
import FakeEventStore from '../../../test/fixtures/fake-event-store';
import FakeFeatureStrategiesStore from '../../../test/fixtures/fake-feature-strategies-store';
import FakeFeatureToggleStore from '../../../test/fixtures/fake-feature-toggle-store';
import FakeFeatureToggleClientStore from '../../../test/fixtures/fake-feature-toggle-client-store';
import FakeProjectStore from '../../../test/fixtures/fake-project-store';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store';
import FakeFeatureEnvironmentStore from '../../../test/fixtures/fake-feature-environment-store';
import FakeContextFieldStore from '../../../test/fixtures/fake-context-field-store';
import FakeGroupStore from '../../../test/fixtures/fake-group-store';
import { FakeAccountStore } from '../../../test/fixtures/fake-account-store';
import FakeAccessStore from '../../../test/fixtures/fake-access-store';
import FakeRoleStore from '../../../test/fixtures/fake-role-store';
import FakeEnvironmentStore from '../../../test/fixtures/fake-environment-store';
import EventStore from '../../db/event-store';
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
    const featureToggleStore = new FeatureToggleStore(db, eventBus, getLogger);
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
    const featureTagStore = new FeatureTagStore(db, eventBus, getLogger);
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
    const roleStore = new RoleStore(db, eventBus, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
    const eventStore = new EventStore(db, getLogger);
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
    );
    const accessService = new AccessService(
        { accessStore, accountStore, roleStore, environmentStore, groupStore },
        { getLogger, flagResolver },
        groupService,
    );
    const segmentService = createSegmentService(db, config);
    const changeRequestAccessReadModel = createChangeRequestAccessReadModel(
        db,
        config,
    );

    const privateProjectChecker = createPrivateProjectChecker(db, config);

    const featureToggleService = new FeatureToggleService(
        {
            featureStrategiesStore,
            featureToggleStore,
            featureToggleClientStore,
            projectStore,
            eventStore,
            featureTagStore,
            featureEnvironmentStore,
            contextFieldStore,
            strategyStore,
        },
        { getLogger, flagResolver },
        segmentService,
        accessService,
        changeRequestAccessReadModel,
        privateProjectChecker,
    );
    return featureToggleService;
};

export const createFakeFeatureToggleService = (
    config: IUnleashConfig,
): FeatureToggleService => {
    const { getLogger, flagResolver } = config;
    const eventStore = new FakeEventStore();
    const strategyStore = new FakeStrategiesStore();
    const featureStrategiesStore = new FakeFeatureStrategiesStore();
    const featureToggleStore = new FakeFeatureToggleStore();
    const featureToggleClientStore = new FakeFeatureToggleClientStore();
    const projectStore = new FakeProjectStore();
    const featureTagStore = new FakeFeatureTagStore();
    const featureEnvironmentStore = new FakeFeatureEnvironmentStore();
    const contextFieldStore = new FakeContextFieldStore();
    const groupStore = new FakeGroupStore();
    const accountStore = new FakeAccountStore();
    const accessStore = new FakeAccessStore();
    const roleStore = new FakeRoleStore();
    const environmentStore = new FakeEnvironmentStore();
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
    );
    const accessService = new AccessService(
        { accessStore, accountStore, roleStore, environmentStore, groupStore },
        { getLogger, flagResolver },
        groupService,
    );
    const segmentService = createFakeSegmentService(config);
    const changeRequestAccessReadModel = createFakeChangeRequestAccessService();
    const fakeprivateProjectChecker = createFakePrivateProjectChecker();
    const featureToggleService = new FeatureToggleService(
        {
            featureStrategiesStore,
            featureToggleStore,
            featureToggleClientStore,
            projectStore,
            eventStore,
            featureTagStore,
            featureEnvironmentStore,
            contextFieldStore,
            strategyStore,
        },
        { getLogger, flagResolver },
        segmentService,
        accessService,
        changeRequestAccessReadModel,
        fakeprivateProjectChecker,
    );
    return featureToggleService;
};
