import {
    AccessService,
    FeatureToggleService,
    GroupService,
    SegmentService,
} from '../services';
import EventStore from '../db/event-store';
import FeatureStrategiesStore from '../db/feature-strategy-store';
import FeatureToggleStore from '../db/feature-toggle-store';
import FeatureToggleClientStore from '../db/feature-toggle-client-store';
import ProjectStore from '../db/project-store';
import FeatureTagStore from '../db/feature-tag-store';
import { FeatureEnvironmentStore } from '../db/feature-environment-store';
import SegmentStore from '../db/segment-store';
import ContextFieldStore from '../db/context-field-store';
import GroupStore from '../db/group-store';
import { AccountStore } from '../db/account-store';
import { AccessStore } from '../db/access-store';
import RoleStore from '../db/role-store';
import EnvironmentStore from '../db/environment-store';
import { Db } from '../db/db';
import { IUnleashConfig } from '../types';

export const createFeatureToggleService = (
    db: Db,
    config: IUnleashConfig,
): FeatureToggleService => {
    const { getLogger, eventBus, flagResolver } = config;
    const eventStore = new EventStore(db, getLogger);
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
        config.inlineSegmentConstraints,
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
    const segmentStore = new SegmentStore(db, eventBus, getLogger);
    const contextFieldStore = new ContextFieldStore(db, getLogger);
    const groupStore = new GroupStore(db);
    const accountStore = new AccountStore(db, getLogger);
    const accessStore = new AccessStore(db, eventBus, getLogger);
    const roleStore = new RoleStore(db, eventBus, getLogger);
    const environmentStore = new EnvironmentStore(db, eventBus, getLogger);
    const groupService = new GroupService(
        { groupStore, eventStore, accountStore },
        { getLogger },
    );
    const accessService = new AccessService(
        { accessStore, accountStore, roleStore, environmentStore },
        { getLogger },
        groupService,
    );
    const segmentService = new SegmentService(
        { segmentStore, featureStrategiesStore, eventStore },
        config,
    );
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
        },
        { getLogger, flagResolver },
        segmentService,
        accessService,
    );
    return featureToggleService;
};
