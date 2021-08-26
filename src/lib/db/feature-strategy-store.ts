import { Knex } from 'knex';
import EventEmitter from 'events';
import * as uuid from 'uuid';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import {
    FeatureToggleWithEnvironment,
    IConstraint,
    IFeatureStrategy,
    IFeatureToggleClient,
    IFeatureToggleQuery,
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
    created_at?: Date;
}

function mapRow(row: IFeatureStrategiesTable): IFeatureStrategy {
    return {
        id: row.id,
        featureName: row.feature_name,
        projectName: row.project_name,
        environment: row.environment,
        strategyName: row.strategy_name,
        parameters: row.parameters,
        constraints: (row.constraints as unknown as IConstraint[]) || [],
        createdAt: row.created_at,
    };
}

function mapInput(input: IFeatureStrategy): IFeatureStrategiesTable {
    return {
        id: input.id,
        feature_name: input.featureName,
        project_name: input.projectName,
        environment: input.environment,
        strategy_name: input.strategyName,
        parameters: input.parameters,
        constraints: JSON.stringify(input.constraints || []),
        created_at: input.createdAt,
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
            `SELECT EXISTS (SELECT 1 FROM ${T.featureStrategies} WHERE id = ?) AS present`,
            [key],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: string): Promise<IFeatureStrategy> {
        const row = await this.db(T.featureStrategies)
            .where({ id: key })
            .first();
        return mapRow(row);
    }

    async createStrategyConfig(
        strategyConfig: Omit<IFeatureStrategy, 'id' | 'createdAt'>,
    ): Promise<IFeatureStrategy> {
        const strategyRow = mapInput({ ...strategyConfig, id: uuid.v4() });
        const rows = await this.db<IFeatureStrategiesTable>(T.featureStrategies)
            .insert(strategyRow)
            .returning('*');
        return mapRow(rows[0]);
    }

    async getStrategiesForToggle(
        featureName: string,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where('feature_name', featureName)
            .from<IFeatureStrategiesTable>(T.featureStrategies);

        stopTimer();
        return rows.map(mapRow);
    }

    async getAllFeatureStrategies(): Promise<IFeatureStrategy[]> {
        const rows = await this.db(T.featureStrategies).select(COLUMNS);
        return rows.map(mapRow);
    }

    async getStrategiesForEnvironment(
        environment: string,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where({ environment })
            .from<IFeatureStrategiesTable>(T.featureStrategies);

        stopTimer();
        return rows.map(mapRow);
    }

    async removeAllStrategiesForEnv(
        feature_name: string,
        environment: string,
    ): Promise<void> {
        await this.db('feature_strategies')
            .where({ feature_name, environment })
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

    async getStrategiesForFeature(
        project_name: string,
        feature_name: string,
        environment: string,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getForFeature');
        const rows = await this.db<IFeatureStrategiesTable>(
            T.featureStrategies,
        ).where({
            project_name,
            feature_name,
            environment,
        });
        stopTimer();
        return rows.map(mapRow);
    }

    async getStrategiesForEnv(
        environment: string,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getStrategiesForEnv');
        const rows = await this.db<IFeatureStrategiesTable>(
            T.featureStrategies,
        ).where({
            environment,
        });
        stopTimer();
        return rows.map(mapRow);
    }

    async getFeatureToggleAdmin(
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
                'features.created_at as created_at',
                'features.last_seen_at as last_seen_at',
                'feature_environments.enabled as enabled',
                'feature_environments.environment as environment',
                'feature_strategies.id as strategy_id',
                'feature_strategies.strategy_name as strategy_name',
                'feature_strategies.parameters as parameters',
                'feature_strategies.constraints as constraints',
            )
            .fullOuterJoin(
                'feature_environments',
                'feature_environments.feature_name',
                'features.name',
            )
            .fullOuterJoin(
                'feature_strategies',
                'feature_strategies.feature_name',
                'features.name',
            )
            .where({ name: featureName, archived: archived ? 1 : 0 });
        stopTimer();
        if (rows.length > 0) {
            const featureToggle = rows.reduce((acc, r) => {
                if (acc.environments === undefined) {
                    acc.environments = {};
                }
                acc.name = r.name;
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
                if (!env.strategies) {
                    env.strategies = [];
                }
                env.strategies.push(this.getAdminStrategy(r));
                acc.environments[r.environment] = env;
                return acc;
            }, {});
            featureToggle.environments = Object.values(
                featureToggle.environments,
            );
            featureToggle.archived = archived;
            return featureToggle;
        }
        throw new NotFoundError(
            `Could not find feature toggle with name ${featureName}`,
        );
    }

    async getFeatures(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
        isAdmin: boolean = true,
    ): Promise<IFeatureToggleClient[]> {
        const environments = [':global:'];
        if (featureQuery?.environment) {
            environments.push(featureQuery.environment);
        }
        const stopTimer = this.timer('getFeatureAdmin');
        let query = this.db('features')
            .select(
                'features.name as name',
                'features.description as description',
                'features.type as type',
                'features.project as project',
                'features.stale as stale',
                'features.variants as variants',
                'features.created_at as created_at',
                'features.last_seen_at as last_seen_at',
                'feature_environments.enabled as enabled',
                'feature_environments.environment as environment',
                'feature_strategies.id as strategy_id',
                'feature_strategies.strategy_name as strategy_name',
                'feature_strategies.parameters as parameters',
                'feature_strategies.constraints as constraints',
            )
            .where({ archived })
            .whereIn('feature_environments.environment', environments)
            .fullOuterJoin(
                'feature_environments',
                'feature_environments.feature_name',
                'features.name',
            )
            .fullOuterJoin(
                'feature_strategies',
                'feature_strategies.feature_name',
                'features.name',
            );
        if (featureQuery) {
            if (featureQuery.tag) {
                const tagQuery = this.db
                    .from('feature_tag')
                    .select('feature_name')
                    .whereIn(['tag_type', 'tag_value'], featureQuery.tag);
                query = query.whereIn('name', tagQuery);
            }
            if (featureQuery.project) {
                query = query.whereIn('project', featureQuery.project);
            }
            if (featureQuery.namePrefix) {
                query = query.where(
                    'name',
                    'like',
                    `${featureQuery.namePrefix}%`,
                );
            }
        }
        const rows = await query;
        stopTimer();
        const featureToggles = rows.reduce((acc, r) => {
            let feature;
            if (acc[r.name]) {
                feature = acc[r.name];
            } else {
                feature = {};
            }
            if (!feature.strategies) {
                feature.strategies = [];
            }
            if (r.strategy_name) {
                feature.strategies.push(this.getAdminStrategy(r, isAdmin));
            }
            if (feature.enabled === undefined) {
                feature.enabled = r.enabled;
            } else {
                feature.enabled = feature.enabled && r.enabled;
            }
            feature.name = r.name;
            feature.description = r.description;
            feature.project = r.project;
            feature.stale = r.stale;
            feature.type = r.type;
            feature.variants = r.variants;
            feature.project = r.project;
            if (isAdmin) {
                feature.lastSeenAt = r.last_seen_at;
                feature.createdAt = r.created_at;
            }
            acc[r.name] = feature;
            return acc;
        }, {});
        return Object.values(featureToggles);
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
            id: r.strategy_id,
        };
        if (!includeId) {
            delete strategy.id;
        }
        return strategy;
    }

    async getStrategiesAndMetadataForEnvironment(
        environment: string,
        featureName: string,
    ): Promise<void> {
        const rows = await this.db(T.featureEnvs)
            .select('*')
            .fullOuterJoin(
                T.featureStrategies,
                `${T.featureEnvs}.feature_name`,
                `${T.featureStrategies}.feature_name`,
            )
            .where(`${T.featureStrategies}.feature_name`, featureName)
            .andWhere(`${T.featureEnvs}.environment`, environment);
        return rows.reduce((acc, r) => {
            if (acc.strategies !== undefined) {
                acc.strategies.push(this.getAdminStrategy(r));
            } else {
                acc.enabled = r.enabled;
                acc.environment = r.environment;
                acc.strategies = [this.getAdminStrategy(r)];
            }
            return acc;
        }, {});
    }

    async deleteConfigurationsForProjectAndEnvironment(
        projectId: String,
        environment: String,
    ): Promise<void> {
        await this.db(T.featureStrategies)
            .where({ project_name: projectId, environment })
            .del();
    }
}

module.exports = FeatureStrategiesStore;
export default FeatureStrategiesStore;
