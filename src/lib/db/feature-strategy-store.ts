import { Knex } from 'knex';
import EventEmitter from 'events';
import { v4 as uuidv4 } from 'uuid';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import {
    FeatureToggleWithEnvironment,
    IConstraint,
    IEnvironmentOverview,
    IFeatureOverview,
    IFeatureStrategy,
    IStrategyConfig,
} from '../types/model';
import { IFeatureStrategiesStore } from '../types/stores/feature-strategies-store';

const COLUMNS = [
    'id',
    'feature_name',
    'project_name',
    'environment',
    'strategy_name',
    'parameters',
    'constraints',
    'created_at',
];
/*
const mapperToColumnNames = {
    createdAt: 'created_at',
    featureName: 'feature_name',
    strategyName: 'strategy_name',
};
*/

const T = {
    features: 'features',
    featureStrategies: 'feature_strategies',
    featureStrategySegment: 'feature_strategy_segment',
    featureEnvs: 'feature_environments',
};

interface IFeatureStrategiesTable {
    id: string;
    feature_name: string;
    project_name: string;
    environment: string;
    strategy_name: string;
    parameters: object;
    constraints: string;
    sort_order: number;
    created_at?: Date;
}

function mapRow(row: IFeatureStrategiesTable): IFeatureStrategy {
    return {
        id: row.id,
        featureName: row.feature_name,
        projectId: row.project_name,
        environment: row.environment,
        strategyName: row.strategy_name,
        parameters: row.parameters,
        constraints: (row.constraints as unknown as IConstraint[]) || [],
        createdAt: row.created_at,
        sortOrder: row.sort_order,
    };
}

function mapInput(input: IFeatureStrategy): IFeatureStrategiesTable {
    return {
        id: input.id,
        feature_name: input.featureName,
        project_name: input.projectId,
        environment: input.environment,
        strategy_name: input.strategyName,
        parameters: input.parameters,
        constraints: JSON.stringify(input.constraints || []),
        created_at: input.createdAt,
        sort_order: input.sortOrder,
    };
}

interface StrategyUpdate {
    strategy_name: string;
    parameters: object;
    constraints: string;
}

function mapStrategyUpdate(
    input: Partial<IStrategyConfig>,
): Partial<StrategyUpdate> {
    const update: Partial<StrategyUpdate> = {};
    if (input.name !== null) {
        update.strategy_name = input.name;
    }
    if (input.parameters !== null) {
        update.parameters = input.parameters;
    }
    update.constraints = JSON.stringify(input.constraints || []);
    return update;
}

class FeatureStrategiesStore implements IFeatureStrategiesStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-toggle-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle-strategies',
                action,
            });
    }

    async delete(key: string): Promise<void> {
        await this.db(T.featureStrategies).where({ id: key }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(T.featureStrategies).delete();
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${T.featureStrategies} WHERE id = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: string): Promise<IFeatureStrategy> {
        const row = await this.db(T.featureStrategies)
            .where({ id: key })
            .first();

        if (!row) {
            throw new NotFoundError(`Could not find strategy with id=${key}`);
        }

        return mapRow(row);
    }

    async createStrategyFeatureEnv(
        strategyConfig: Omit<IFeatureStrategy, 'id' | 'createdAt'>,
    ): Promise<IFeatureStrategy> {
        const strategyRow = mapInput({ ...strategyConfig, id: uuidv4() });
        const rows = await this.db<IFeatureStrategiesTable>(T.featureStrategies)
            .insert(strategyRow)
            .returning('*');
        return mapRow(rows[0]);
    }

    async removeAllStrategiesForFeatureEnv(
        featureName: string,
        environment: string,
    ): Promise<void> {
        await this.db('feature_strategies')
            .where({ feature_name: featureName, environment })
            .del();
    }

    async getAll(): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .from<IFeatureStrategiesTable>(T.featureStrategies);

        stopTimer();
        return rows.map(mapRow);
    }

    async getStrategiesForFeatureEnv(
        projectId: string,
        featureName: string,
        environment: string,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getForFeature');
        const rows = await this.db<IFeatureStrategiesTable>(T.featureStrategies)
            .where({
                project_name: projectId,
                feature_name: featureName,
                environment,
            })
            .orderBy('sort_order', 'asc');
        stopTimer();
        return rows.map(mapRow);
    }

    async getFeatureToggleWithEnvs(
        featureName: string,
        archived: boolean = false,
    ): Promise<FeatureToggleWithEnvironment> {
        const stopTimer = this.timer('getFeatureAdmin');
        const rows = await this.db('features')
            .select(
                'features.name as name',
                'features.description as description',
                'features.type as type',
                'features.project as project',
                'features.stale as stale',
                'features.variants as variants',
                'features.impression_data as impression_data',
                'features.created_at as created_at',
                'features.last_seen_at as last_seen_at',
                'feature_environments.enabled as enabled',
                'feature_environments.environment as environment',
                'environments.name as environment_name',
                'environments.type as environment_type',
                'environments.sort_order as environment_sort_order',
                'feature_strategies.id as strategy_id',
                'feature_strategies.strategy_name as strategy_name',
                'feature_strategies.parameters as parameters',
                'feature_strategies.constraints as constraints',
                'feature_strategies.sort_order as sort_order',
            )
            .fullOuterJoin(
                'feature_environments',
                'feature_environments.feature_name',
                'features.name',
            )
            .fullOuterJoin('feature_strategies', function () {
                this.on(
                    'feature_strategies.feature_name',
                    '=',
                    'feature_environments.feature_name',
                ).andOn(
                    'feature_strategies.environment',
                    '=',
                    'feature_environments.environment',
                );
            })
            .fullOuterJoin(
                'environments',
                'feature_environments.environment',
                'environments.name',
            )
            .where('features.name', featureName)
            .andWhere('features.archived', archived ? 1 : 0);
        stopTimer();
        if (rows.length > 0) {
            const featureToggle = rows.reduce((acc, r) => {
                if (acc.environments === undefined) {
                    acc.environments = {};
                }
                acc.name = r.name;
                acc.impressionData = r.impression_data;
                acc.description = r.description;
                acc.project = r.project;
                acc.stale = r.stale;
                acc.variants = r.variants;
                acc.createdAt = r.created_at;
                acc.lastSeenAt = r.last_seen_at;
                acc.type = r.type;
                if (!acc.environments[r.environment]) {
                    acc.environments[r.environment] = {
                        name: r.environment,
                    };
                }
                const env = acc.environments[r.environment];
                env.enabled = r.enabled;
                env.type = r.environment_type;
                env.sortOrder = r.environment_sort_order;
                if (!env.strategies) {
                    env.strategies = [];
                }
                if (r.strategy_id) {
                    env.strategies.push(this.getAdminStrategy(r));
                }
                acc.environments[r.environment] = env;
                return acc;
            }, {});
            featureToggle.environments = Object.values(
                featureToggle.environments,
            ).sort((a, b) => {
                // @ts-ignore
                return a.sortOrder - b.sortOrder;
            });
            featureToggle.environments = featureToggle.environments.map((e) => {
                e.strategies = e.strategies.sort(
                    (a, b) => a.sortOrder - b.sortOrder,
                );
                return e;
            });
            featureToggle.variants = featureToggle.variants || [];
            featureToggle.variants.sort((a, b) => a.name.localeCompare(b.name));
            featureToggle.archived = archived;
            return featureToggle;
        }
        throw new NotFoundError(
            `Could not find feature toggle with name ${featureName}`,
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private getEnvironment(r: any): IEnvironmentOverview {
        return {
            name: r.environment,
            enabled: r.enabled,
            type: r.environment_type,
            sortOrder: r.environment_sort_order,
        };
    }

    async getFeatureOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IFeatureOverview[]> {
        const rows = await this.db('features')
            .where({ project: projectId, archived })
            .select(
                'features.name as feature_name',
                'features.type as type',
                'features.created_at as created_at',
                'features.last_seen_at as last_seen_at',
                'features.stale as stale',
                'feature_environments.enabled as enabled',
                'feature_environments.environment as environment',
                'environments.type as environment_type',
                'environments.sort_order as environment_sort_order',
            )
            .fullOuterJoin(
                'feature_environments',
                'feature_environments.feature_name',
                'features.name',
            )
            .fullOuterJoin(
                'environments',
                'feature_environments.environment',
                'environments.name',
            );
        if (rows.length > 0) {
            const overview = rows.reduce((acc, r) => {
                if (acc[r.feature_name] !== undefined) {
                    acc[r.feature_name].environments.push(
                        this.getEnvironment(r),
                    );
                } else {
                    acc[r.feature_name] = {
                        type: r.type,
                        name: r.feature_name,
                        createdAt: r.created_at,
                        lastSeenAt: r.last_seen_at,
                        stale: r.stale,
                        environments: [this.getEnvironment(r)],
                    };
                }
                return acc;
            }, {});
            return Object.values(overview).map((o: IFeatureOverview) => ({
                ...o,
                environments: o.environments
                    .filter((f) => f.name)
                    .sort((a, b) => {
                        if (a.sortOrder === b.sortOrder) {
                            return a.name.localeCompare(b.name);
                        }
                        return a.sortOrder - b.sortOrder;
                    }),
            }));
        }
        return [];
    }

    async getStrategyById(id: string): Promise<IFeatureStrategy> {
        const strat = await this.db(T.featureStrategies).where({ id }).first();
        if (strat) {
            return mapRow(strat);
        }
        throw new NotFoundError(`Could not find strategy with id: ${id}`);
    }

    async updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
    ): Promise<IFeatureStrategy> {
        const update = mapStrategyUpdate(updates);
        const row = await this.db<IFeatureStrategiesTable>(T.featureStrategies)
            .where({ id })
            .update(update)
            .returning('*');
        return mapRow(row[0]);
    }

    private getAdminStrategy(
        r: any,
        includeId: boolean = true,
    ): IStrategyConfig {
        const strategy = {
            name: r.strategy_name,
            constraints: r.constraints || [],
            parameters: r.parameters,
            sortOrder: r.sort_order,
            id: r.strategy_id,
        };
        if (!includeId) {
            delete strategy.id;
        }
        return strategy;
    }

    async deleteConfigurationsForProjectAndEnvironment(
        projectId: String,
        environment: String,
    ): Promise<void> {
        await this.db(T.featureStrategies)
            .where({ project_name: projectId, environment })
            .del();
    }

    async setProjectForStrategiesBelongingToFeature(
        featureName: string,
        newProjectId: string,
    ): Promise<void> {
        await this.db(T.featureStrategies)
            .where({ feature_name: featureName })
            .update({ project_name: newProjectId });
    }

    async getStrategiesBySegment(
        segmentId: number,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getStrategiesBySegment');
        const rows = await this.db
            .select(this.prefixColumns())
            .from<IFeatureStrategiesTable>(T.featureStrategies)
            .join(
                T.featureStrategySegment,
                `${T.featureStrategySegment}.feature_strategy_id`,
                `${T.featureStrategies}.id`,
            )
            .where(`${T.featureStrategySegment}.segment_id`, '=', segmentId);
        stopTimer();
        return rows.map(mapRow);
    }

    prefixColumns(): string[] {
        return COLUMNS.map((c) => `${T.featureStrategies}.${c}`);
    }
}

module.exports = FeatureStrategiesStore;
export default FeatureStrategiesStore;
