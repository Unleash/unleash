import type { Knex } from 'knex';
import type {
    FeatureToggleWithEnvironment,
    IDependency,
    IFeatureOverview,
    IFeatureStrategy,
    IStrategyConfig,
    IVariant,
} from '../../../types/model.js';
import type { Store } from '../../../types/stores/store.js';
import type { IFeatureProjectUserParams } from '../feature-toggle-controller.js';

export interface FeatureConfigurationClient {
    name: string;
    type: string;
    enabled: boolean;
    project: string;
    stale: boolean;
    strategies: IStrategyConfig[];
    variants: IVariant[];
    dependencies?: IDependency[];
}

export interface IFeatureSearchParams {
    userId: number;
    searchParams?: string[];
    project?: string;
    segment?: string;
    createdAt?: string;
    createdBy?: string;
    state?: string;
    type?: string;
    tag?: string;
    lifecycle?: string;
    lastSeenAt?: string;
    status?: string[][];
    offset: number;
    favoritesFirst?: boolean;
    archived?: boolean;
    limit: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
}

export type IQueryOperator =
    | 'IS'
    | 'IS_NOT'
    | 'IS_ANY_OF'
    | 'IS_NONE_OF'
    | 'INCLUDE'
    | 'DO_NOT_INCLUDE'
    | 'INCLUDE_ALL_OF'
    | 'INCLUDE_ANY_OF'
    | 'EXCLUDE_IF_ANY_OF'
    | 'EXCLUDE_ALL'
    | 'IS_BEFORE'
    | 'IS_ON_OR_AFTER';

export interface IQueryParam {
    field: string;
    operator: IQueryOperator;
    values: (string | null)[];
}

export interface IFeatureStrategiesStore
    extends Store<IFeatureStrategy, string> {
    getDb(): Knex;

    createStrategyFeatureEnv(
        strategyConfig: Omit<IFeatureStrategy, 'id' | 'createdAt'>,
    ): Promise<IFeatureStrategy>;

    removeAllStrategiesForFeatureEnv(
        featureName: string,
        environment: string,
    ): Promise<void>;

    getStrategiesForFeatureEnv(
        projectId: string,
        featureName: string,
        environment: string,
    ): Promise<IFeatureStrategy[]>;

    getFeatureToggleWithEnvs(
        featureName: string,
        userId?: number,
        archived?: boolean,
    ): Promise<FeatureToggleWithEnvironment>;

    getFeatureToggleWithVariantEnvs(
        featureName: string,
        userId?: number,
        archived?,
    ): Promise<FeatureToggleWithEnvironment>;

    getFeatureOverview(
        params: IFeatureProjectUserParams,
    ): Promise<IFeatureOverview[]>;

    getStrategyById(id: string): Promise<IFeatureStrategy>;

    updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
        trx?: Knex,
    ): Promise<IFeatureStrategy>;

    deleteConfigurationsForProjectAndEnvironment(
        projectId: String,
        environment: String,
    ): Promise<void>;

    setProjectForStrategiesBelongingToFeature(
        featureName: string,
        newProjectId: string,
    ): Promise<void>;

    getStrategiesBySegment(segmentId: number): Promise<IFeatureStrategy[]>;

    getStrategiesByContextField(
        contextFieldName: string,
    ): Promise<IFeatureStrategy[]>;

    updateSortOrder(id: string, sortOrder: number): Promise<void>;

    getAllByFeatures(
        features: string[],
        environment?: string,
    ): Promise<IFeatureStrategy[]>;

    getCustomStrategiesInUseCount(): Promise<number>;

    getDefaultStickiness(projectId: string): Promise<string>;
}
