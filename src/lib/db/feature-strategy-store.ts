import { Knex } from 'knex';
import EventEmitter from 'events';
import * as uuid from 'uuid';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import {
    IConstraint,
    IEnvironmentOverview,
    IFeatureOverview,
    IFeatureToggleClient,
    IFeatureToggleQuery,
    IStrategyConfig,
    IVariant,
    FeatureToggleWithEnvironment,
    IFeatureEnvironment,
} from '../types/model';
import NotFoundError from '../error/notfound-error';

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

export interface IFeatureStrategy {
    id: string;
    featureName: string;
    projectName: string;
    environment: string;
    strategyName: string;
    parameters: object;
    constraints: IConstraint[];
    createdAt?: Date;
}

export interface FeatureConfigurationClient {
    name: string;
    type: string;
    enabled: boolean;
    stale: boolean;
    strategies: IStrategyConfig[];
    variants: IVariant[];
}

function mapRow(row: IFeatureStrategiesTable): IFeatureStrategy {
    return {
        id: row.id,
        featureName: row.feature_name,
        projectName: row.project_name,
        environment: row.environment,
        strategyName: row.strategy_name,
        parameters: row.parameters,
        constraints: ((row.constraints as unknown) as IConstraint[]) || [],
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

class FeatureStrategiesStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-toggle-store.ts');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-toggle-strategies',
                action,
            });
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

    async deleteFeatureStrategies(): Promise<void> {
        await this.db(T.featureStrategies).delete();
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
                acc.stale = r.stale;
                acc.variants = r.variants;
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
            return featureToggle;
        }
        throw new NotFoundError(
            `Could not find feature toggle with name ${featureName}`,
        );
    }

    async getFeatures(
        featureQuery?: IFeatureToggleQuery,
        archived: boolean = false,
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
                feature.strategies.push(this.getAdminStrategy(r));
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
            feature.lastSeenAt = r.last_seen_at;
            feature.project = r.project;
            acc[r.name] = feature;
            return acc;
        }, {});
        return Object.values(featureToggles);
    }

    async getProjectOverview(
        projectId: string,
        archived: boolean = false,
    ): Promise<IFeatureOverview[]> {
        const rows = await this.db('features')
            .where({ project: projectId, archived })
            .select(
                'features.name as feature_name',
                'features.type as type',
                'feature_environments.enabled as enabled',
                'feature_environments.environment as environment',
                'environments.display_name as display_name',
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
                        environments: [this.getEnvironment(r)],
                    };
                }
                return acc;
            }, {});
            return Object.values(overview).map((o: IFeatureOverview) => ({
                ...o,
                environments: o.environments.filter(f => f.name),
            }));
        }
        throw new NotFoundError(`Could not find project with id ${projectId}`);
    }

    async getStrategyById(id: string): Promise<IFeatureStrategy> {
        const strat = await this.db(T.featureStrategies)
            .where({ id })
            .first();
        if (strat) {
            return mapRow(strat);
        }
        throw new NotFoundError(`Could not find strategy with id: ${id}`);
    }

    async connectEnvironmentAndFeature(
        feature_name: string,
        environment: string,
        enabled: boolean = false,
    ): Promise<void> {
        await this.db('feature_environments')
            .insert({ feature_name, environment, enabled })
            .onConflict(['environment', 'feature_name'])
            .merge('enabled');
    }

    async;

    async enableEnvironmentForFeature(
        feature_name: string,
        environment: string,
    ): Promise<void> {
        await this.db(T.featureEnvs)
            .update({ enabled: true })
            .where({ feature_name, environment });
    }

    async removeEnvironmentForFeature(
        feature_name: string,
        environment: string,
    ): Promise<void> {
        await this.db(T.featureEnvs)
            .where({ feature_name, environment })
            .del();
    }

    async disconnectEnvironmentFromProject(
        environment: string,
        project: string,
    ): Promise<void> {
        const featureSelector = this.db('features')
            .where({ project })
            .select('name');
        await this.db(T.featureEnvs)
            .where({ environment })
            .andWhere('feature_name', 'IN', featureSelector)
            .del();
        await this.db('feature_strategies').where({
            environment,
            project_name: project,
        });
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

    async getMembers(projectId: string): Promise<number> {
        const rolesFromProject = this.db('role_permission')
            .select('role_id')
            .where({ project: projectId });

        const numbers = await this.db('role_user')
            .count('user_id as members')
            .whereIn('role_id', rolesFromProject)
            .first();
        const { members } = numbers;
        if (typeof members === 'string') {
            return parseInt(members, 10);
        }
        return members;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private getEnvironment(r: any): IEnvironmentOverview {
        return {
            name: r.environment,
            displayName: r.display_name,
            enabled: r.enabled,
        };
    }

    private getAdminStrategy(r: any): IStrategyConfig {
        return {
            name: r.strategy_name,
            constraints: r.constraints || [],
            parameters: r.parameters,
            id: r.strategy_id,
        };
    }

    async getEnvironmentMetaData(
        environment: string,
        featureName: string,
    ): Promise<IFeatureEnvironment> {
        const md = await this.db(T.featureEnvs)
            .where('feature_name', featureName)
            .andWhere('environment', environment)
            .first();
        if (md) {
            return {
                enabled: md.enabled,
                featureName,
                environment,
            };
        }
        throw new NotFoundError(
            `Could not find ${featureName} in ${environment}`,
        );
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

    async isEnvironmentEnabled(
        featureName: string,
        environment: string,
    ): Promise<boolean> {
        const row = await this.db(T.featureEnvs)
            .select('enabled')
            .where({ feature_name: featureName, environment })
            .first();
        return row.enabled;
    }

    async toggleEnvironmentEnabledStatus(
        environment: string,
        featureName: string,
        enabled: boolean,
    ): Promise<boolean> {
        await this.db(T.featureEnvs)
            .update({ enabled })
            .where({ environment, feature_name: featureName });
        return enabled;
    }

    async getAllFeatureEnvironments(): Promise<IFeatureEnvironment[]> {
        const rows = await this.db(T.featureEnvs);
        return rows.map(r => ({
            environment: r.environment,
            featureName: r.feature_name,
            enabled: r.enabled,
        }));
    }

    async featureHasEnvironment(
        environment: string,
        featureName: string,
    ): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureEnvs} WHERE feature_name = ? AND environment = ?)  AS present`,
            [featureName, environment],
        );
        const { present } = result.rows[0];
        return present;
    }

    async hasStrategy(id: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${T.featureStrategies} WHERE id = ?)  AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }
}

module.exports = FeatureStrategiesStore;
export default FeatureStrategiesStore;
