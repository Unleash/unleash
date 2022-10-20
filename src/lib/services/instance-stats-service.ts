import { sha256 } from 'js-sha256';
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
import { ISegmentStore } from '../types/stores/segment-store';
import { IRoleStore } from '../types/stores/role-store';
import VersionService from './version-service';
import { ISettingStore } from '../types/stores/settings-store';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface InstanceStats {
    instanceId: string;
    timestamp: Date;
    versionOSS: string;
    versionEnterprise?: string;
    users: number;
    featureToggles: number;
    projects: number;
    contextFields: number;
    roles: number;
    groups: number;
    environments: number;
    segments: number;
    strategies: number;
    SAMLenabled: boolean;
    OIDCenabled: boolean;
}

interface InstanceStatsSigned extends InstanceStats {
    sum: string;
}

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

    private versionService: VersionService;

    private settingStore: ISettingStore;

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
        >,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        versionService: VersionService,
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
        this.logger = getLogger('services/stats-service.js');
    }

    async getToggleCount(): Promise<number> {
        return this.featureToggleStore.count({
            archived: false,
        });
    }

    async hasOIDC(): Promise<boolean> {
        const settings = await this.settingStore.get(
            'unleash.enterprise.auth.oidc',
        );

        return settings?.enabled || false;
    }

    async hasSAML(): Promise<boolean> {
        const settings = await this.settingStore.get(
            'unleash.enterprise.auth.saml',
        );

        return settings?.enabled || false;
    }

    async getStats(): Promise<InstanceStats> {
        const versionInfo = this.versionService.getVersionInfo();

        const [
            featureToggles,
            users,
            projects,
            contextFields,
            groups,
            roles,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
        ] = await Promise.all([
            this.getToggleCount(),
            this.userStore.count(),
            this.projectStore.count(),
            this.contextFieldStore.count(),
            this.groupStore.count(),
            this.roleStore.count(),
            this.environmentStore.count(),
            this.segmentStore.count(),
            this.strategyStore.count(),
            this.hasSAML(),
            this.hasOIDC(),
        ]);

        return {
            timestamp: new Date(),
            instanceId: versionInfo.instanceId,
            versionOSS: versionInfo.current.oss,
            versionEnterprise: versionInfo.current.enterprise,
            users,
            featureToggles,
            projects,
            contextFields,
            roles,
            groups,
            environments,
            segments,
            strategies,
            SAMLenabled,
            OIDCenabled,
        };
    }

    async getSignedStats(): Promise<InstanceStatsSigned> {
        const instanceStats = await this.getStats();

        const sum = sha256(
            `${instanceStats.instanceId}${instanceStats.users}${instanceStats.featureToggles}${instanceStats.projects}${instanceStats.roles}${instanceStats.groups}${instanceStats.environments}${instanceStats.segments}`,
        );
        return { ...instanceStats, sum };
    }
}
