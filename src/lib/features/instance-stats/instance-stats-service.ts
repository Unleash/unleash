import { sha256 } from 'js-sha256';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../types/option';
import {
    IClientInstanceStore,
    IClientMetricsStoreV2,
    IEventStore,
    IUnleashStores,
} from '../../types/stores';
import { IContextFieldStore } from '../../types/stores/context-field-store';
import { IEnvironmentStore } from '../project-environments/environment-store-type';
import { IFeatureToggleStore } from '../feature-toggle/types/feature-toggle-store-type';
import { IGroupStore } from '../../types/stores/group-store';
import { IProjectStore } from '../../features/project/project-store-type';
import { IStrategyStore } from '../../types/stores/strategy-store';
import { IUserStore } from '../../types/stores/user-store';
import { ISegmentStore } from '../segment/segment-store-type';
import { IRoleStore } from '../../types/stores/role-store';
import VersionService from '../../services/version-service';
import { ISettingStore } from '../../types/stores/settings-store';
import {
    FEATURES_EXPORTED,
    FEATURES_IMPORTED,
    IApiTokenStore,
} from '../../types';
import { CUSTOM_ROOT_ROLE_TYPE } from '../../util';
import { type GetActiveUsers } from './getActiveUsers';
import { ProjectModeCount } from '../project/project-store';
import { GetProductionChanges } from './getProductionChanges';

export type TimeRange = 'allTime' | '30d' | '7d';

export interface InstanceStats {
    instanceId: string;
    timestamp: Date;
    versionOSS: string;
    versionEnterprise?: string;
    users: number;
    serviceAccounts: number;
    apiTokens: Map<string, number>;
    featureToggles: number;
    projects: ProjectModeCount[];
    contextFields: number;
    roles: number;
    customRootRoles: number;
    customRootRolesInUse: number;
    featureExports: number;
    featureImports: number;
    groups: number;
    environments: number;
    segments: number;
    strategies: number;
    SAMLenabled: boolean;
    OIDCenabled: boolean;
    clientApps: { range: TimeRange; count: number }[];
    activeUsers: Awaited<ReturnType<GetActiveUsers>>;
    productionChanges: Awaited<ReturnType<GetProductionChanges>>;
    previousDayMetricsBucketsCount: {
        enabledCount: number;
        variantCount: number;
    };
}

export type InstanceStatsSigned = Omit<InstanceStats, 'projects'> & {
    projects: number;
    sum: string;
};

export class InstanceStatsService {
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

    private eventStore: IEventStore;

    private apiTokenStore: IApiTokenStore;

    private versionService: VersionService;

    private settingStore: ISettingStore;

    private clientInstanceStore: IClientInstanceStore;

    private clientMetricsStore: IClientMetricsStoreV2;

    private appCount?: Partial<{ [key in TimeRange]: number }>;

    private getActiveUsers: GetActiveUsers;

    private getProductionChanges: GetProductionChanges;

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
            settingStore,
            clientInstanceStore,
            eventStore,
            apiTokenStore,
            clientMetricsStoreV2,
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
            | 'settingStore'
            | 'clientInstanceStore'
            | 'eventStore'
            | 'apiTokenStore'
            | 'clientMetricsStoreV2'
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        versionService: VersionService,
        getActiveUsers: GetActiveUsers,
        getProductionChanges: GetProductionChanges,
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
        this.versionService = versionService;
        this.settingStore = settingStore;
        this.eventStore = eventStore;
        this.clientInstanceStore = clientInstanceStore;
        this.logger = getLogger('services/stats-service.js');
        this.getActiveUsers = getActiveUsers;
        this.getProductionChanges = getProductionChanges;
        this.apiTokenStore = apiTokenStore;
        this.clientMetricsStore = clientMetricsStoreV2;
    }

    async refreshAppCountSnapshot(): Promise<
        Partial<{ [key in TimeRange]: number }>
    > {
        try {
            this.appCount = await this.getLabeledAppCounts();
            return this.appCount;
        } catch (error) {
            this.logger.warn(
                'Unable to retrieve statistics. This will be retried',
                error,
            );
            return {
                '7d': 0,
                '30d': 0,
                allTime: 0,
            };
        }
    }

    getProjectModeCount(): Promise<ProjectModeCount[]> {
        return this.projectStore.getProjectModeCounts();
    }

    getToggleCount(): Promise<number> {
        return this.featureToggleStore.count({
            archived: false,
        });
    }

    async hasOIDC(): Promise<boolean> {
        const settings = await this.settingStore.get<{ enabled: boolean }>(
            'unleash.enterprise.auth.oidc',
        );

        return settings?.enabled || false;
    }

    async hasSAML(): Promise<boolean> {
        const settings = await this.settingStore.get<{ enabled: boolean }>(
            'unleash.enterprise.auth.saml',
        );

        return settings?.enabled || false;
    }

    /**
     * use getStatsSnapshot for low latency, sacrificing data-freshness
     */
    async getStats(): Promise<InstanceStats> {
        const versionInfo = await this.versionService.getVersionInfo();
        const [
            featureToggles,
            users,
            serviceAccounts,
            apiTokens,
            activeUsers,
            projects,
            contextFields,
            groups,
            roles,
            customRootRoles,
            customRootRolesInUse,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
            clientApps,
            featureExports,
            featureImports,
            productionChanges,
            previousDayMetricsBucketsCount,
        ] = await Promise.all([
            this.getToggleCount(),
            this.userStore.count(),
            this.userStore.countServiceAccounts(),
            this.apiTokenStore.countByType(),
            this.getActiveUsers(),
            this.getProjectModeCount(),
            this.contextFieldStore.count(),
            this.groupStore.count(),
            this.roleStore.count(),
            this.roleStore.filteredCount({ type: CUSTOM_ROOT_ROLE_TYPE }),
            this.roleStore.filteredCountInUse({ type: CUSTOM_ROOT_ROLE_TYPE }),
            this.environmentStore.count(),
            this.segmentStore.count(),
            this.strategyStore.count(),
            this.hasSAML(),
            this.hasOIDC(),
            this.appCount ? this.appCount : this.refreshAppCountSnapshot(),
            this.eventStore.filteredCount({ type: FEATURES_EXPORTED }),
            this.eventStore.filteredCount({ type: FEATURES_IMPORTED }),
            this.getProductionChanges(),
            this.clientMetricsStore.countPreviousDayHourlyMetricsBuckets(),
        ]);

        return {
            timestamp: new Date(),
            instanceId: versionInfo.instanceId,
            versionOSS: versionInfo.current.oss,
            versionEnterprise: versionInfo.current.enterprise,
            users,
            serviceAccounts,
            apiTokens,
            activeUsers,
            featureToggles,
            projects,
            contextFields,
            roles,
            customRootRoles,
            customRootRolesInUse,
            groups,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
            clientApps: Object.entries(clientApps).map(([range, count]) => ({
                range: range as TimeRange,
                count,
            })),
            featureExports,
            featureImports,
            productionChanges,
            previousDayMetricsBucketsCount,
        };
    }

    async getLabeledAppCounts(): Promise<
        Partial<{ [key in TimeRange]: number }>
    > {
        const [t7d, t30d, allTime] = await Promise.all([
            this.clientInstanceStore.getDistinctApplicationsCount(7),
            this.clientInstanceStore.getDistinctApplicationsCount(30),
            this.clientInstanceStore.getDistinctApplicationsCount(),
        ]);
        return {
            '7d': t7d,
            '30d': t30d,
            allTime,
        };
    }

    getAppCountSnapshot(range: TimeRange): number | undefined {
        return this.appCount?.[range];
    }

    async getSignedStats(): Promise<InstanceStatsSigned> {
        const instanceStats = await this.getStats();
        const totalProjects = instanceStats.projects
            .map((p) => p.count)
            .reduce((a, b) => a + b, 0);

        const sum = sha256(
            `${instanceStats.instanceId}${instanceStats.users}${instanceStats.featureToggles}${totalProjects}${instanceStats.roles}${instanceStats.groups}${instanceStats.environments}${instanceStats.segments}`,
        );
        return { ...instanceStats, sum, projects: totalProjects };
    }
}
