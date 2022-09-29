import { Logger } from '../logger';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { IContextFieldStore } from '../types/stores/context-field-store';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureToggleStore } from '../types/stores/feature-toggle-store';
import { IGroupStore } from '../types/stores/group-store';
import { IProjectStore } from '../types/stores/project-store';
import { IStrategyStore } from '../types/stores/strategy-store';
import { IUserStore } from '../types/stores/user-store';
import EventEmitter from 'events';
import { ISegmentStore } from '../types/stores/segment-store';
import { IRoleStore } from '../types/stores/role-store';

class StatsService {
    private logger: Logger;

    private strategyStore: IStrategyStore;

    private userStore: IUserStore;

    private featureToggleStore: IFeatureToggleStore;

    private contextFieldStore: IContextFieldStore;

    private projectStore: IProjectStore;

    private groupStore: IGroupStore;

    private environmentStore: IEnvironmentStore;

    private segmentStore: ISegmentStore;

    private roleStore: IRoleStore;

    private eventBus: EventEmitter;

    constructor(
        {
            featureToggleStore,
            userStore,
            projectStore,
            environmentStore,
            strategyStore,
            contextFieldStore,
            groupStore,
            segmentStore,
            roleStore,
        }: Pick<
            IUnleashStores,
            | 'featureToggleStore'
            | 'userStore'
            | 'projectStore'
            | 'environmentStore'
            | 'strategyStore'
            | 'contextFieldStore'
            | 'groupStore'
            | 'segmentStore'
            | 'roleStore'
        >,
        { getLogger, eventBus }: Pick<IUnleashConfig, 'getLogger' | 'eventBus'>,
    ) {
        this.strategyStore = strategyStore;
        this.userStore = userStore;
        this.featureToggleStore = featureToggleStore;
        this.environmentStore = environmentStore;
        this.projectStore = projectStore;
        this.groupStore = groupStore;
        this.contextFieldStore = contextFieldStore;
        this.segmentStore = segmentStore;
        this.roleStore = roleStore;

        this.eventBus = eventBus;
        this.logger = getLogger('services/stats-service.js');
    }

    async getToggleCount(): Promise<number> {
        return this.featureToggleStore.count({
            archived: false,
        });
    }

    async getSegmentsCount(): Promise<number> {
        return this.segmentStore.count();
    }

    async getProjectCount(): Promise<number> {
        return this.projectStore.count();
    }

    async getProjectRoleCount(): Promise<number> {
        return this.roleStore.getProjectRolesCount();
    }

    async getGroupsCount(): Promise<number> {
        return this.groupStore.count();
    }

    async getContextFieldCount(): Promise<number> {
        return this.contextFieldStore.count();
    }
}
export default StatsService;
