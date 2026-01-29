import type { ITagType } from '../features/tag-type/tag-type-store-type.js';
import type { LogProvider } from '../logger.js';
import type { IRole } from './stores/access-store.js';
import type { IUser } from './user.js';
import type { ALL_OPERATORS } from '../util/index.js';
import type { IProjectStats } from '../features/project/project-service.js';
import type { ProjectEnvironment } from '../features/project/project-store-type.js';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service.js';
import type { IFlagResolver } from './experimental.js';
import type { Collaborator } from '../features/feature-toggle/types/feature-collaborators-read-model-type.js';
import type { EventEmitter } from 'events';
import type { ITag } from '../tags/index.js';
import type { IFeatureLink } from '../features/feature-links/feature-links-read-model-type.js';

export type Operator = (typeof ALL_OPERATORS)[number];

export interface IConstraint {
    contextName: string;
    operator: Operator;
    values?: string[];
    value?: string;
    inverted?: boolean;
    caseInsensitive?: boolean;
}
export enum WeightType {
    VARIABLE = 'variable',
    FIX = 'fix',
}
export interface IStrategyConfig {
    id?: string;
    name: string;
    featureName?: string;
    constraints?: IConstraint[];
    variants?: IStrategyVariant[];
    segments?: number[];
    parameters?: { [key: string]: string };
    sortOrder?: number;
    milestoneId?: string;
    title?: string | null;
    disabled?: boolean | null;
}
export interface IFeatureStrategy {
    id: string;
    featureName: string;
    projectId: string;
    environment: string;
    strategyName: string;
    parameters: { [key: string]: string };
    sortOrder?: number;
    milestoneId?: string;
    constraints: IConstraint[];
    variants?: IStrategyVariant[];
    createdAt?: Date;
    segments?: number[];
    title?: string | null;
    disabled?: boolean | null;
}

export interface FeatureToggleDTO {
    name: string;
    description?: string | null;
    type?: string;
    stale?: boolean;
    archived?: boolean;
    archivedAt?: Date;
    createdAt?: Date;
    impressionData?: boolean;
    variants?: IVariant[];
    tags?: ITag[];
    createdByUserId?: number;
    createdBy?: {
        id: number;
        name: string;
        imageUrl: string;
    };
}

export interface FeatureToggle extends FeatureToggleDTO {
    project: string;
    lastSeenAt?: Date;
    createdAt?: Date;
}

export interface IFeatureToggleListItem extends FeatureToggle {
    environments?: Partial<IEnvironmentBase>[];
    favorite: boolean;
}

export interface IFeatureToggleClient {
    name: string;
    description: string | undefined | null;
    type: string;
    project: string;
    stale: boolean;
    variants: IVariant[];
    enabled: boolean;
    strategies: Omit<IStrategyConfig, 'disabled'>[];
    dependencies?: IDependency[];
    impressionData?: boolean;
    lastSeenAt?: Date;
    createdAt?: Date;
    tags?: ITag[];
    favorite?: boolean;
}

export interface FeatureStrategy {
    name: string;
    title?: string | null;
    disabled?: boolean | null;
    sortOrder?: number;
    constraints?: IConstraint[];
    variants?: IStrategyVariant[];
    parameters?: { [key: string]: string };
}
export interface IFeatureEnvironmentInfo {
    name: string;
    environment: string;
    enabled: boolean;
    strategies: IFeatureStrategy[];
    defaultStrategy: FeatureStrategy | undefined;
}

export interface FeatureToggleWithEnvironment extends FeatureToggle {
    environments: IEnvironmentDetail[];
}

export interface FeatureToggleView extends FeatureToggleWithEnvironment {
    dependencies: IDependency[];
    children: string[];
    lifecycle: IFeatureLifecycleStage | undefined;
    collaborators?: { users: Collaborator[] };
    links: Omit<IFeatureLink, 'feature'>[];
}

export interface IEnvironmentDetail extends IEnvironmentBase {
    strategies: IStrategyConfig[];
    variants: IVariant[];
}

export interface ISortOrder {
    [index: string]: number;
}

export interface IFeatureEnvironment {
    environment: string;
    featureName: string;
    enabled: boolean;
    lastSeenAt?: Date;
    variants?: IVariant[];
}

export interface IVariant {
    name: string;
    weight: number;
    weightType: 'variable' | 'fix';
    payload?: {
        type: 'json' | 'csv' | 'string' | 'number';
        value: string;
    };
    stickiness: string;
    overrides?: {
        contextName: string;
        values: string[];
    }[];
}

export interface IDependency {
    feature: string;
    variants?: string[];
    enabled?: boolean;
}

export type StageName =
    | 'initial'
    | 'pre-live'
    | 'live'
    | 'completed'
    | 'archived';

export interface IFeatureLifecycleStage {
    stage: StageName;
    enteredStageAt: Date;
    status?: string;
}

export type IProjectLifecycleStageDuration = {
    duration: number;
    project: string;
    stage: StageName;
};

export interface IFeatureDependency {
    feature: string;
    dependency: IDependency;
}

export type IStrategyVariant = Omit<IVariant, 'overrides'>;

export enum ApiTokenType {
    /** @deprecated: Use BACKEND instead */
    CLIENT = 'client',
    ADMIN = 'admin',
    FRONTEND = 'frontend',
    BACKEND = 'backend',
}

export interface IApiTokenCreate {
    secret: string;
    tokenName: string;
    alias?: string;
    type: ApiTokenType;
    environment: string;
    projects: string[];
    expiresAt?: Date;
}

export interface IApiToken extends Omit<IApiTokenCreate, 'alias'> {
    createdAt: Date;
    seenAt?: Date;
    environment: string;
    project: string;
    alias?: string | null;
}

export interface IEnvironment {
    name: string;
    type: string;
    sortOrder: number;
    enabled: boolean;
    protected: boolean;
    projectCount?: number;
    apiTokenCount?: number;
    enabledToggleCount?: number;
    requiredApprovals?: number | null;
}

export interface IProjectEnvironment extends IEnvironment {
    projectApiTokenCount?: number;
    projectEnabledToggleCount?: number;
    defaultStrategy?: FeatureStrategy;
}

export interface IProjectsAvailableOnEnvironment extends IProjectEnvironment {
    visible: boolean;
}

export interface IEnvironmentCreate {
    name: string;
    type: string;
    sortOrder?: number;
    enabled?: boolean;
    requiredApprovals?: number | null;
}

export interface IEnvironmentClone {
    name: string;
    projects?: string[];
    type: string;
    clonePermissions?: boolean;
}

export interface IEnvironmentBase {
    name: string;
    enabled: boolean;
    type: string;
    sortOrder: number;
    lastSeenAt: Date;
}

export interface IEnvironmentOverview extends IEnvironmentBase {
    variantCount: number;
    hasStrategies?: boolean;
    hasEnabledStrategies?: boolean;
    yes?: number;
    no?: number;
}

export interface IFeatureOverview {
    name: string;
    description: string;
    project: string;
    favorite: boolean;
    impressionData: boolean;
    segments: string[];
    type: string;
    stale: boolean;
    createdAt: Date;
    lastSeenAt: Date;
    environments: IEnvironmentOverview[];
    lifecycle?: IFeatureLifecycleStage;
}
export interface FeatureEnvironment {
    name: string;
    featureName?: string;
    environment?: string;
    type?: string;
    enabled: boolean;
    sortOrder?: number;
    variantCount: number;
    changeRequestIds?: number[];
    milestoneName?: string;
    milestoneOrder?: number;
    totalMilestones?: number;
    lastSeenAt?: Date;
    hasStrategies?: boolean;
    hasEnabledStrategies?: boolean;
}
export interface FeatureSearchEnvironment extends FeatureEnvironment {
    yes: number;
    no: number;
}

export type IFeatureSearchOverview = Exclude<
    IFeatureOverview,
    'environments'
> & {
    dependencyType: 'parent' | 'child' | null;
    environments: FeatureSearchEnvironment[];
    archivedAt: string;
    createdBy: {
        id: number;
        name: string;
        imageUrl: string;
    };
};

export interface IFeatureTypeCount {
    type: string;
    count: number;
}

export type ProjectMode = 'open' | 'protected' | 'private';

export interface IFeatureNaming {
    pattern: string | null;
    example?: string | null;
    description?: string | null;
}

export interface IProjectHealth {
    name: string;
    description: string;
    environments: ProjectEnvironment[];
    features: IFeatureOverview[];
    members: number;
    version: number;
    technicalDebt: number;
    favorite?: boolean;
    updatedAt?: Date;
    createdAt: Date | undefined;
    stats?: IProjectStats;
    mode: ProjectMode;
    featureLimit?: number;
    featureNaming?: IFeatureNaming;
    defaultStickiness: string;
    /**
     * @deprecated
     */
    health: number;
}

export type ProjectOnboardingStatus =
    | {
          status: 'onboarding-started' | 'onboarded';
      }
    | { status: 'first-flag-created'; feature: string };

export interface IProjectOverview {
    name: string;
    description: string;
    environments: ProjectEnvironment[];
    featureTypeCounts: IFeatureTypeCount[];
    members: number;
    version: number;
    technicalDebt: number;
    favorite?: boolean;
    updatedAt?: Date;
    archivedAt?: Date;
    createdAt: Date | undefined;
    stats?: IProjectStats;
    mode: ProjectMode;
    featureLimit?: number;
    featureNaming?: IFeatureNaming;
    defaultStickiness: string;
    onboardingStatus: ProjectOnboardingStatus;
    linkTemplates?: IProjectLinkTemplate[];
    /**
     * @deprecated
     */
    health: number;
}

export interface IProjectHealthReport extends IProjectHealth {
    staleCount: number;
    potentiallyStaleCount: number;
    activeCount: number;
}

export interface IProjectParam {
    projectId: string;
}

export interface IProjectLinkTemplate {
    title?: string;
    urlTemplate: string;
}

export interface IArchivedQuery {
    archived: boolean;
}
export interface ITagQuery {
    tagType: string;
    tagValue: string;
}
export interface IFeatureToggleQuery {
    tag?: string[][];
    project?: string[];
    namePrefix?: string;
    environment?: string;
    inlineSegmentConstraints?: boolean;
}

export interface IFeatureToggleDeltaQuery extends IFeatureToggleQuery {
    toggleNames?: string[];
    environment: string;
}

export interface IAddonParameterDefinition {
    name: string;
    displayName: string;
    type: string;
    description?: string;
    placeholder?: string;
    required: boolean;
    sensitive: boolean;
}

export interface IAddonDefinition {
    name: string;
    displayName: string;
    documentationUrl: string;
    description: string;
    deprecated?: string;
    parameters?: IAddonParameterDefinition[];
    events?: string[];
    tagTypes?: ITagType[];
    installation?: IAddonInstallation;
    alerts?: IAddonAlert[];
    howTo?: string;
}

export interface IAddonInstallation {
    url: string;
    title?: string;
    helpText?: string;
}

export interface IAddonAlert {
    type: 'success' | 'info' | 'warning' | 'error';
    text: string;
}

export interface IAddonConfig {
    getLogger: LogProvider;
    unleashUrl: string;
    integrationEventsService: IntegrationEventsService;
    flagResolver: IFlagResolver;
    eventBus: EventEmitter;
}

export interface IUserWithRole {
    id: number;
    roleId: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
    addedAt: Date;
}

export interface IRoleData {
    role: IRole;
    users: IUser[];
    permissions: IPermission[];
}

export interface IAvailablePermissions {
    root: IPermission[];
    project: IPermission[];
    environments: IEnvironmentPermission[];
}

export interface IPermission {
    id: number;
    name: string;
    displayName: string;
    type: string;
    environment?: string | null;
}

export interface IEnvironmentPermission {
    name: string;
    permissions: IPermission[];
}

export enum PermissionType {
    root = 'root',
    project = 'project',
}

export enum RoleName {
    ADMIN = 'Admin',
    EDITOR = 'Editor',
    VIEWER = 'Viewer',
    OWNER = 'Owner',
    MEMBER = 'Member',
    READER = 'Reader',
}

export enum RoleType {
    ROOT = 'root',
    ROOT_CUSTOM = 'root-custom',
    PROJECT = 'project',
}

export interface IRoleIdentifier {
    roleId?: number;
    roleName?: RoleName;
}

export interface IFrontendClientApp {
    appName: string;
    instanceId: string;
    sdkVersion: string;
    sdkType: 'frontend';
    environment: string;
    projects?: string[];
    createdBy?: string;
}

export interface IClientApp {
    appName: string;
    instanceId: string;
    clientIp?: string;
    environment?: string;
    seenToggles?: string[];
    metricsCount?: number;
    strategies?: string[] | Record<string, string>[];
    projects?: string[];
    count?: number;
    started?: string | number | Date;
    interval?: number;
    icon?: string;
    description?: string;
    color?: string;
    platformName?: string;
    platformVersion?: string;
    yggdrasilVersion?: string;
    specVersion?: string;
    sdkType?: 'frontend' | 'backend' | null;
    sdkVersion?: string;
}

export interface IAppFeature {
    name: string;
    description: string;
    type: string;
    project: string;
    enabled: boolean;
    stale: boolean;
    strategies: any;
    variants: any[];
    createdAt: Date;
    lastSeenAt: Date;
}

export interface IAppName {
    appName: string;
}

export interface IMetricCounts {
    yes?: number;
    no?: number;
    variants?: Record<string, number>;
}

export interface IMetricsBucket {
    start: Date;
    stop: Date;
    toggles: { [key: string]: IMetricCounts };
}

// Create project aligns with #/components/schemas/createProjectSchema
// joi is providing default values when the optional inputs are not provided
// const data = await projectSchema.validateAsync(newProject);
export type CreateProject = Pick<IProject, 'name'> & {
    id?: string;
    mode?: ProjectMode;
    defaultStickiness?: string;
    environments?: string[];
    changeRequestEnvironments?: { name: string; requiredApprovals?: number }[];
};

// Create project aligns with #/components/schemas/projectCreatedSchema
export type ProjectCreated = Pick<
    IProject,
    | 'id'
    | 'name'
    | 'mode'
    | 'defaultStickiness'
    | 'description'
    | 'featureLimit'
> & {
    environments: string[];
    changeRequestEnvironments?: { name: string; requiredApprovals: number }[];
};

export interface IProject {
    id: string;
    name: string;
    description?: string;
    health?: number;
    createdAt?: Date;
    updatedAt?: Date;
    archivedAt?: Date;
    changeRequestsEnabled?: boolean;
    mode: ProjectMode;
    defaultStickiness: string;
    featureLimit?: number;
    featureNaming?: IFeatureNaming;
    linkTemplates?: IProjectLinkTemplate[];
}

export interface IProjectApplications {
    applications: IProjectApplication[];
    total: number;
}

export interface IProjectApplication {
    name: string;
    environments: string[];
    instances: string[];
    sdks: IProjectApplicationSdk[];
}

export interface IProjectApplicationSdk {
    name: string;
    versions: string[];
}

// mimics UpdateProjectSchema
export interface IProjectUpdate {
    id: string;
    name: string;
    description?: string;
    mode?: ProjectMode;
    defaultStickiness?: string;
    featureLimit?: number;
}

/**
 * Extends IRole making description mandatory
 */
export interface ICustomRole extends IRole {
    description: string;
}

export interface IClientSegment {
    id: number;
    constraints: IConstraint[];
    name: string;
}

export interface ISegment {
    id: number;
    name: string;
    description?: string;
    project?: string;
    constraints: IConstraint[];
    usedInProjects?: number;
    usedInFeatures?: number;
    createdBy?: string;
    createdAt: Date;
}

export interface IFeatureStrategySegment {
    featureStrategyId: string;
    segmentId: number;
}

export interface IUserAccessOverview {
    userId: number;
    createdAt?: Date;
    userName?: string;
    userEmail: number;
    lastSeen?: Date;
    accessibleProjects: string[];
    groups: string[];
    rootRole: string;
    groupProjects: string[];
}

export interface ISdkHeartbeat {
    sdkVersion: string;
    sdkName: string;
    metadata: ISdkHeartbeatMetadata;
}

export interface ISdkHeartbeatMetadata {
    platformName?: string;
    platformVersion?: string;
    yggdrasilVersion?: string;
    specVersion?: string;
}

export interface EnvironmentRevisionId {
    environment: string;
    revisionId: number;
}
