import { sha256 } from 'js-sha256';
import type { Logger } from '../../logger.js';
import type { IUnleashConfig } from '../../types/option.js';
import type {
    IClientInstanceStore,
    IClientMetricsStoreV2,
    IEventStore,
    IFeatureStrategiesReadModel,
    IFeatureStrategiesStore,
    ITrafficDataUsageStore,
    IUnleashStores,
} from '../../types/stores.js';
import type { IContextFieldStore } from '../context/context-field-store-type.js';
import type { IEnvironmentStore } from '../project-environments/environment-store-type.js';
import type { IFeatureToggleStore } from '../feature-toggle/types/feature-toggle-store-type.js';
import type { IGroupStore } from '../../types/stores/group-store.js';
import type { IProjectStore } from '../../features/project/project-store-type.js';
import type { IStrategyStore } from '../../types/stores/strategy-store.js';
import type { IUserStore } from '../../types/stores/user-store.js';
import type { ISegmentStore } from '../segment/segment-store-type.js';
import type { IRoleStore } from '../../types/stores/role-store.js';
import type VersionService from '../../services/version-service.js';
import type { ISettingStore } from '../../types/stores/settings-store.js';
import { FEATURES_EXPORTED, FEATURES_IMPORTED } from '../../events/index.js';
import type { IApiTokenStore, IFlagResolver } from '../../types/index.js';
import { CUSTOM_ROOT_ROLE_TYPE } from '../../util/index.js';
import type { GetActiveUsers } from './getActiveUsers.js';
import type { ProjectModeCount } from '../project/project-store.js';
import type { GetProductionChanges } from './getProductionChanges.js';
import { format, minutesToMilliseconds } from 'date-fns';
import memoizee from 'memoizee';
import type { GetLicensedUsers } from './getLicensedUsers.js';
import type { GetReadOnlyUsers } from './getReadOnlyUsers.js';
import type { IFeatureUsageInfo } from '../../services/version-service.js';
import type { ReleasePlanTemplateStore } from '../release-plans/release-plan-template-store.js';
import type { ReleasePlanStore } from '../release-plans/release-plan-store.js';
import type { GetEdgeInstances } from './getEdgeInstances.js';

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
    archivedFeatureToggles: number;
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
    passwordAuthEnabled: boolean;
    SCIMenabled: boolean;
    clientApps: { range: TimeRange; count: number }[];
    activeUsers: Awaited<ReturnType<GetActiveUsers>>;
    licensedUsers: Awaited<ReturnType<GetLicensedUsers>>;
    productionChanges: Awaited<ReturnType<GetProductionChanges>>;
    previousDayMetricsBucketsCount: {
        enabledCount: number;
        variantCount: number;
    };
    maxEnvironmentStrategies: number;
    maxConstraints: number;
    maxConstraintValues: number;
    releaseTemplates?: number;
    releasePlans?: number;
    edgeInstanceUsage?: Awaited<ReturnType<GetEdgeInstances>>;
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

    private flagResolver: IFlagResolver;

    private appCount?: Partial<{ [key in TimeRange]: number }>;

    getActiveUsers: GetActiveUsers;

    getLicencedUsers: GetLicensedUsers;

    getReadOnlyUsers: GetReadOnlyUsers;

    getProductionChanges: GetProductionChanges;

    getEdgeInstances: GetEdgeInstances;

    private featureStrategiesReadModel: IFeatureStrategiesReadModel;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private trafficDataUsageStore: ITrafficDataUsageStore;

    private releasePlanTemplateStore: ReleasePlanTemplateStore;

    private releasePlanStore: ReleasePlanStore;

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
            featureStrategiesReadModel,
            featureStrategiesStore,
            trafficDataUsageStore,
            releasePlanTemplateStore,
            releasePlanStore,
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
            | 'featureStrategiesReadModel'
            | 'featureStrategiesStore'
            | 'trafficDataUsageStore'
            | 'releasePlanTemplateStore'
            | 'releasePlanStore'
        >,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        versionService: VersionService,
        getActiveUsers: GetActiveUsers,
        getProductionChanges: GetProductionChanges,
        getLicencedUsers: GetLicensedUsers,
        getReadOnlyUsers: GetReadOnlyUsers,
        getEdgeInstances: GetEdgeInstances,
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
        this.getActiveUsers = () =>
            this.memorize('getActiveUsers', getActiveUsers.bind(this));
        this.getLicencedUsers = () =>
            this.memorize('getLicencedUsers', getLicencedUsers.bind(this));
        this.getReadOnlyUsers = () =>
            this.memorize('getReadOnlyUsers', getReadOnlyUsers.bind(this));
        this.getProductionChanges = () =>
            this.memorize(
                'getProductionChanges',
                getProductionChanges.bind(this),
            );
        this.getEdgeInstances = () =>
            this.memorize('getEdgeInstances', getEdgeInstances.bind(this));
        this.apiTokenStore = apiTokenStore;
        this.clientMetricsStore = clientMetricsStoreV2;
        this.flagResolver = flagResolver;
        this.featureStrategiesReadModel = featureStrategiesReadModel;
        this.featureStrategiesStore = featureStrategiesStore;
        this.trafficDataUsageStore = trafficDataUsageStore;
        this.releasePlanTemplateStore = releasePlanTemplateStore;
        this.releasePlanStore = releasePlanStore;
    }

    memory = new Map<string, () => Promise<any>>();
    memorize<T>(key: string, fn: () => Promise<T>): Promise<T> {
        const variant = this.flagResolver.getVariant('memorizeStats', {
            memoryKey: key,
        });
        if (variant.feature_enabled) {
            const minutes =
                variant.payload?.type === 'number'
                    ? Number(variant.payload.value)
                    : 1;

            let memoizedFunction = this.memory.get(key);
            if (!memoizedFunction) {
                memoizedFunction = memoizee(() => fn(), {
                    promise: true,
                    maxAge: minutesToMilliseconds(minutes),
                });
                this.memory.set(key, memoizedFunction);
            }
            return memoizedFunction();
        } else {
            return fn();
        }
    }

    getProjectModeCount(): Promise<ProjectModeCount[]> {
        return this.memorize('getProjectModeCount', () =>
            this.projectStore.getProjectModeCounts(),
        );
    }

    getToggleCount(): Promise<number> {
        return this.memorize('getToggleCount', () =>
            this.featureToggleStore.count({
                archived: false,
            }),
        );
    }

    getArchivedToggleCount(): Promise<number> {
        return this.memorize('hasOIDC', () =>
            this.featureToggleStore.count({
                archived: true,
            }),
        );
    }

    async hasOIDC(): Promise<boolean> {
        return this.memorize('hasOIDC', async () => {
            const settings = await this.settingStore.get<{ enabled: boolean }>(
                'unleash.enterprise.auth.oidc',
            );

            return settings?.enabled || false;
        });
    }

    async hasSAML(): Promise<boolean> {
        return this.memorize('hasSAML', async () => {
            const settings = await this.settingStore.get<{ enabled: boolean }>(
                'unleash.enterprise.auth.saml',
            );

            return settings?.enabled || false;
        });
    }

    async hasPasswordAuth(): Promise<boolean> {
        return this.memorize('hasPasswordAuth', async () => {
            const settings = await this.settingStore.get<{ disabled: boolean }>(
                'unleash.auth.simple',
            );

            return (
                typeof settings?.disabled === 'undefined' ||
                settings.disabled === false
            );
        });
    }

    async hasSCIM(): Promise<boolean> {
        return this.memorize('hasSCIM', async () => {
            const settings = await this.settingStore.get<{ enabled: boolean }>(
                'scim',
            );

            return settings?.enabled || false;
        });
    }

    async getReleaseTemplates(): Promise<number> {
        return this.memorize('getReleaseTemplates', async () => {
            const count = await this.releasePlanTemplateStore.count();
            return count;
        });
    }

    async getReleasePlans(): Promise<number> {
        return this.memorize('getReleasePlans', async () => {
            const count = await this.releasePlanStore.count();
            return count;
        });
    }

    async getStats(): Promise<InstanceStats> {
        const versionInfo = await this.versionService.getVersionInfo();
        const [
            featureToggles,
            archivedFeatureToggles,
            users,
            serviceAccounts,
            apiTokens,
            activeUsers,
            licensedUsers,
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
            passwordAuthEnabled,
            SCIMenabled,
            clientApps,
            featureExports,
            featureImports,
            productionChanges,
            previousDayMetricsBucketsCount,
            maxEnvironmentStrategies,
            maxConstraintValues,
            maxConstraints,
            releaseTemplates,
            releasePlans,
            edgeInstanceUsage,
        ] = await Promise.all([
            this.getToggleCount(),
            this.getArchivedToggleCount(),
            this.getRegisteredUsers(),
            this.countServiceAccounts(),
            this.countApiTokensByType(),
            this.getActiveUsers(),
            this.getLicencedUsers(),
            this.getProjectModeCount(),
            this.contextFieldCount(),
            this.groupCount(),
            this.roleCount(),
            this.customRolesCount(),
            this.customRolesCountInUse(),
            this.environmentCount(),
            this.segmentCount(),
            this.strategiesCount(),
            this.hasSAML(),
            this.hasOIDC(),
            this.hasPasswordAuth(),
            this.hasSCIM(),
            this.appCount ? this.appCount : this.getLabeledAppCounts(),
            this.featuresExported(),
            this.featuresImported(),
            this.getProductionChanges(),
            this.countPreviousDayHourlyMetricsBuckets(),
            this.memorize(
                'maxFeatureEnvironmentStrategies',
                this.featureStrategiesReadModel.getMaxFeatureEnvironmentStrategies.bind(
                    this.featureStrategiesReadModel,
                ),
            ),
            this.memorize(
                'maxConstraintValues',
                this.featureStrategiesReadModel.getMaxConstraintValues.bind(
                    this.featureStrategiesReadModel,
                ),
            ),
            this.memorize(
                'maxConstraintsPerStrategy',
                this.featureStrategiesReadModel.getMaxConstraintsPerStrategy.bind(
                    this.featureStrategiesReadModel,
                ),
            ),
            this.getReleaseTemplates(),
            this.getReleasePlans(),
            this.getEdgeInstances(),
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
            licensedUsers,
            featureToggles,
            archivedFeatureToggles,
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
            passwordAuthEnabled,
            SCIMenabled,
            clientApps: Object.entries(clientApps).map(([range, count]) => ({
                range: range as TimeRange,
                count,
            })),
            featureExports,
            featureImports,
            productionChanges,
            previousDayMetricsBucketsCount,
            maxEnvironmentStrategies: maxEnvironmentStrategies?.count ?? 0,
            maxConstraintValues: maxConstraintValues?.count ?? 0,
            maxConstraints: maxConstraints?.count ?? 0,
            releaseTemplates,
            releasePlans,
            edgeInstanceUsage,
        };
    }

    async getFeatureUsageInfo(): Promise<IFeatureUsageInfo> {
        const [
            featureToggles,
            users,
            projectModeCount,
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
            featureExports,
            featureImports,
            customStrategies,
            customStrategiesInUse,
            userActive,
            productionChanges,
            postgresVersion,
            licenseType,
            hostedBy,
            releaseTemplates,
            releasePlans,
            edgeInstanceUsage,
        ] = await Promise.all([
            this.getToggleCount(),
            this.getRegisteredUsers(),
            this.getProjectModeCount(),
            this.contextFieldCount(),
            this.groupCount(),
            this.roleCount(),
            this.customRolesCount(),
            this.customRolesCountInUse(),
            this.environmentCount(),
            this.segmentCount(),
            this.strategiesCount(),
            this.hasSAML(),
            this.hasOIDC(),
            this.featuresExported(),
            this.featuresImported(),
            this.customStrategiesCount(),
            this.customStrategiesInUseCount(),
            this.getActiveUsers(),
            this.getProductionChanges(),
            this.postgresVersion(),
            this.getLicenseType(),
            this.getHostedBy(),
            this.getReleaseTemplates(),
            this.getReleasePlans(),
            this.getEdgeInstances(),
        ]);
        const versionInfo = await this.versionService.getVersionInfo();

        const featureInfo = {
            featureToggles,
            users,
            projects: projectModeCount
                .map((p) => p.count)
                .reduce((a, b) => a + b, 0),
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
            featureExports,
            featureImports,
            customStrategies,
            customStrategiesInUse,
            instanceId: versionInfo.instanceId,
            versionOSS: versionInfo.current.oss,
            versionEnterprise: versionInfo.current.enterprise,
            activeUsers30: userActive.last30,
            activeUsers60: userActive.last60,
            activeUsers90: userActive.last90,
            productionChanges30: productionChanges.last30,
            productionChanges60: productionChanges.last60,
            productionChanges90: productionChanges.last90,
            postgresVersion,
            licenseType,
            hostedBy,
            releaseTemplates,
            releasePlans,
            edgeInstanceUsage,
        };
        return featureInfo;
    }

    getHostedBy(): string {
        return 'self-hosted';
    }

    getLicenseType(): string {
        return 'oss';
    }

    featuresExported(): Promise<number> {
        return this.memorize('searchEventsCountFeaturesExported', () =>
            this.eventStore.searchEventsCount([
                {
                    field: 'type',
                    operator: 'IS',
                    values: [FEATURES_EXPORTED],
                },
            ]),
        );
    }

    featuresImported(): Promise<number> {
        return this.memorize('searchEventsCountFeaturesImported', () =>
            this.eventStore.searchEventsCount([
                {
                    field: 'type',
                    operator: 'IS',
                    values: [FEATURES_IMPORTED],
                },
            ]),
        );
    }

    customStrategiesCount(): Promise<number> {
        return this.memorize(
            'customStrategiesCount',
            async () =>
                (await this.strategyStore.getEditableStrategies()).length,
        );
    }

    customStrategiesInUseCount(): Promise<number> {
        return this.memorize(
            'customStrategiesInUseCount',
            async () =>
                await this.featureStrategiesStore.getCustomStrategiesInUseCount(),
        );
    }

    postgresVersion(): Promise<string> {
        return this.memorize('postgresVersion', () =>
            this.settingStore.postgresVersion(),
        );
    }

    groupCount(): Promise<number> {
        return this.memorize('groupCount', () => this.groupStore.count());
    }

    roleCount(): Promise<number> {
        return this.memorize('roleCount', () => this.roleStore.count());
    }

    customRolesCount(): Promise<number> {
        return this.memorize('customRolesCount', () =>
            this.roleStore.filteredCount({ type: CUSTOM_ROOT_ROLE_TYPE }),
        );
    }

    customRolesCountInUse(): Promise<number> {
        return this.memorize('customRolesCountInUse', () =>
            this.roleStore.filteredCountInUse({
                type: CUSTOM_ROOT_ROLE_TYPE,
            }),
        );
    }

    segmentCount(): Promise<number> {
        return this.memorize('segmentCount', () => this.segmentStore.count());
    }

    contextFieldCount(): Promise<number> {
        return this.memorize('contextFieldCount', () =>
            this.contextFieldStore.count(),
        );
    }

    strategiesCount(): Promise<number> {
        return this.memorize('strategiesCount', () =>
            this.strategyStore.count(),
        );
    }

    environmentCount(): Promise<number> {
        return this.memorize('environmentCount', () =>
            this.environmentStore.count(),
        );
    }

    countPreviousDayHourlyMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }> {
        return this.memorize('countPreviousDayHourlyMetricsBuckets', () =>
            this.clientMetricsStore.countPreviousDayHourlyMetricsBuckets(),
        );
    }

    countApiTokensByType(): Promise<Map<string, number>> {
        return this.memorize('countApiTokensByType', () =>
            this.apiTokenStore.countByType(),
        );
    }

    getRegisteredUsers(): Promise<number> {
        return this.memorize('getRegisteredUsers', () =>
            this.userStore.count(),
        );
    }

    countServiceAccounts(): Promise<number> {
        return this.memorize('countServiceAccounts', () =>
            this.userStore.countServiceAccounts(),
        );
    }

    async getCurrentTrafficData(): Promise<number> {
        return this.memorize('getCurrentTrafficData', async () => {
            const traffic =
                await this.trafficDataUsageStore.getTrafficDataUsageForPeriod(
                    format(new Date(), 'yyyy-MM'),
                );

            const counts = traffic.map((item) => item.count);
            return counts.reduce((total, current) => total + current, 0);
        });
    }

    async getLabeledAppCounts(): Promise<
        Partial<{ [key in TimeRange]: number }>
    > {
        return this.memorize('getLabeledAppCounts', async () => {
            const [t7d, t30d, allTime] = await Promise.all([
                this.clientInstanceStore.getDistinctApplicationsCount(7),
                this.clientInstanceStore.getDistinctApplicationsCount(30),
                this.clientInstanceStore.getDistinctApplicationsCount(),
            ]);
            this.appCount = {
                '7d': t7d,
                '30d': t30d,
                allTime,
            };
            return this.appCount;
        });
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
