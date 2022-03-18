import { ITagType } from './stores/tag-type-store';
import { LogProvider } from '../logger';
import { IRole } from './stores/access-store';
import { IUser } from './user';

export interface IConstraint {
    contextName: string;
    operator: string;
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
    constraints: IConstraint[];
    parameters: object;
    sortOrder?: number;
}
export interface IFeatureStrategy {
    id: string;
    featureName: string;
    projectId: string;
    environment: string;
    strategyName: string;
    parameters: object;
    sortOrder?: number;
    constraints: IConstraint[];
    createdAt?: Date;
}

export interface FeatureToggleDTO {
    name: string;
    description?: string;
    type?: string;
    stale?: boolean;
    archived?: boolean;
    createdAt?: Date;
    impressionData?: boolean;
}

export interface FeatureToggle extends FeatureToggleDTO {
    project: string;
    lastSeenAt?: Date;
    createdAt?: Date;
    variants?: IVariant[];
}

export interface IFeatureToggleClient {
    name: string;
    description: string;
    type: string;
    project: string;
    stale: boolean;
    variants: IVariant[];
    enabled: boolean;
    strategies: IStrategyConfig[];
    impressionData?: boolean;
    lastSeenAt?: Date;
    createdAt?: Date;
}

export interface IFeatureEnvironmentInfo {
    name: string;
    environment: string;
    enabled: boolean;
    strategies: IFeatureStrategy[];
}

export interface FeatureToggleWithEnvironment extends FeatureToggle {
    environments: IEnvironmentDetail[];
}

// @deprecated
export interface FeatureToggleLegacy extends FeatureToggle {
    strategies: IStrategyConfig[];
    enabled: boolean;
}

export interface IEnvironmentDetail extends IEnvironmentOverview {
    strategies: IStrategyConfig[];
}

export interface ISortOrder {
    [index: string]: number;
}

export interface IFeatureEnvironment {
    environment: string;
    featureName: string;
    enabled: boolean;
}

export interface IVariant {
    name: string;
    weight: number;
    weightType: string;
    payload?: {
        type: string;
        value: string;
    };
    stickiness: string;
    overrides?: {
        contextName: string;
        values: string[];
    }[];
}

export interface IEnvironment {
    name: string;
    type: string;
    sortOrder: number;
    enabled: boolean;
    protected: boolean;
}

export interface IEnvironmentCreate {
    name: string;
    type: string;
    sortOrder?: number;
    enabled?: boolean;
}

export interface IEnvironmentOverview {
    name: string;
    enabled: boolean;
    type: string;
    sortOrder: number;
}

export interface IFeatureOverview {
    name: string;
    type: string;
    stale: boolean;
    createdAt: Date;
    lastSeenAt: Date;
    environments: IEnvironmentOverview[];
}

export interface IProjectOverview {
    name: string;
    description: string;
    environments: string[];
    features: IFeatureOverview[];
    members: number;
    version: number;
    health: number;
    updatedAt?: Date;
}

export interface IProjectHealthReport extends IProjectOverview {
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
}

export interface ITag {
    value: string;
    type: string;
}

export interface IParameterDefinition {
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
    parameters?: IParameterDefinition[];
    events?: string[];
    tagTypes?: ITagType[];
}

export interface IAddonConfig {
    getLogger: LogProvider;
    unleashUrl: string;
}

export interface IUserWithRole {
    id: number;
    roleId: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
}

export interface IRoleData {
    role: IRole;
    users: IUser[];
    permissions: IPermission[];
}

export interface IAvailablePermissions {
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
    // eslint-disable-next-line @typescript-eslint/no-shadow
    ADMIN = 'Admin',
    EDITOR = 'Editor',
    VIEWER = 'Viewer',
    OWNER = 'Owner',
    MEMBER = 'Member',
}

export enum RoleType {
    ROOT = 'root',
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
    bucket?: any;
    count?: number;
    started?: number | Date;
    interval?: number;
    icon?: string;
    description?: string;
    color?: string;
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
    toggles: IMetricCounts;
}

export interface IImportFile extends ImportCommon {
    file: string;
}

interface ImportCommon {
    dropBeforeImport?: boolean;
    keepExisting?: boolean;
    userName?: string;
}

export interface IImportData extends ImportCommon {
    data: any;
}

export interface IProject {
    id: string;
    name: string;
    description: string;
    health?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICustomRole {
    id: number;
    name: string;
    description: string;
    type: string;
}

export interface IProjectWithCount extends IProject {
    featureCount: number;
    memberCount: number;
}

export interface ISegment {
    id: number;
    name: string;
    description?: string;
    constraints: IConstraint[];
    createdBy?: string;
    createdAt: Date;
}

export interface IFeatureStrategySegment {
    featureStrategyId: string;
    segmentId: number;
}
