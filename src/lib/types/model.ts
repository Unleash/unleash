import type { ITagType } from '../features/tag-type/tag-type-store-type';
import type { LogProvider } from '../logger';
import type { IRole } from './stores/access-store';
import type { IUser } from './user';
import type { ALL_OPERATORS } from '../util';
import type { IProjectStats } from '../features/project/project-service';
import type { CreateFeatureStrategySchema } from '../openapi';
import type { ProjectEnvironment } from '../features/project/project-store-type';
import type { FeatureSearchEnvironmentSchema } from '../openapi/spec/feature-search-environment-schema';
import type { IntegrationEventsService } from '../features/integration-events/integration-events-service';
import type { IFlagResolver } from './experimental';
import type { Collaborator } from '../features/feature-toggle/types/feature-collaborators-read-model-type';
import type { EventEmitter } from 'events';

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
    constraints: IConstraint[];
    variants?: IStrategyVariant[];
    createdAt?: Date;
    segments?: number[];
    title?: string | null;
    disabled?: boolean | null;
}

export interface FeatureToggleDTO {
    name: string;
    description?: string;
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
    description: string;
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

export interface IFeatureEnvironmentInfo {
    name: string;
    environment: string;
    enabled: boolean;
    strategies: IFeatureStrategy[];
    defaultStrategy: CreateFeatureStrategySchema | null;
}

export interface FeatureToggleWithEnvironment extends FeatureToggle {
    environments: IEnvironmentDetail[];
}

export interface FeatureToggleView extends FeatureToggleWithEnvironment {
    dependencies: IDependency[];
    children: string[];
    lifecycle: IFeatureLifecycleStage | undefined;
    collaborators?: { users: Collaborator[] };
}

// @deprecated
export interface FeatureToggleLegacy extends FeatureToggle {
    strategies: IStrategyConfig[];
    enabled: boolean;
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

export interface IEnvironment {
    name: string;
    type: string;
    sortOrder: number;
    enabled: boolean;
    protected: boolean;
    projectCount?: number;
    apiTokenCount?: number;
    enabledToggleCount?: number;
}

export interface IProjectEnvironment extends IEnvironment {
    projectApiTokenCount?: number;
    projectEnabledToggleCount?: number;
    defaultStrategy?: CreateFeatureStrategySchema;
}

export interface IEnvironmentCreate {
    name: string;
    type: string;
    sortOrder?: number;
    enabled?: boolean;
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

export type IFeatureSearchOverview = Exclude<
    IFeatureOverview,
    'environments'
> & {
    dependencyType: 'parent' | 'child' | null;
    environments: FeatureSearchEnvironmentSchema[];
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
    health: number;
    favorite?: boolean;
    updatedAt?: Date;
    createdAt: Date | undefined;
    stats?: IProjectStats;
    mode: ProjectMode;
    featureLimit?: number;
    featureNaming?: IFeatureNaming;
    defaultStickiness: string;
}

export interface IProjectOverview {
    name: string;
    description: string;
    environments: ProjectEnvironment[];
    featureTypeCounts: IFeatureTypeCount[];
    members: number;
    version: number;
    health: number;
    favorite?: boolean;
    updatedAt?: Date;
    archivedAt?: Date;
    createdAt: Date | undefined;
    stats?: IProjectStats;
    mode: ProjectMode;
    featureLimit?: number;
    featureNaming?: IFeatureNaming;
    defaultStickiness: string;
}

export interface IProjectHealthReport extends IProjectHealth {
    staleCount: number;
    potentiallyStaleCount: number;
    activeCount: number;
}

export interface IProjectParam {
    projectId: string;
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

export interface ITag {
    value: string;
    type: string;
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
    environment?: string;
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

export interface IClientApp {
    appName: string;
    instanceId: string;
    clientIp?: string;
    environment?: string;
    seenToggles?: string[];
    metricsCount?: number;
    strategies?: string[] | Record<string, string>[];
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

// @deprecated Remove with flag useProjectReadModel
export interface IProjectWithCount extends IProject {
    featureCount: number;
    staleFeatureCount: number;
    potentiallyStaleFeatureCount: number;
    memberCount: number;
    favorite?: boolean;
    avgTimeToProduction: number;
    archivedAt?: Date;
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
