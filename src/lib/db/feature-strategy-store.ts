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
    IStrategyConfig,
    IVariant,
} from '../types/model';
import NotFoundError from '../error/notfound-error';

const COLUMNS = [
    'id',
    'feature_name',
    'project',
    'enabled',
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

const TABLE = 'feature_strategies';

interface IFeatureStrategiesTable {
    id: string;
    feature_name: string;
    project_name: string;
    environment: string;
    strategy_name: string;
    parameters: object;
    constraints: IConstraint[];
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
        constraints: row.constraints,
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
        constraints: input.constraints,
        created_at: input.createdAt,
    };
}

interface StrategyUpdate {
    strategy_name: string;
    parameters: object;
    constraints: IConstraint[];
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
    if (input.constraints !== null) {
        update.constraints = input.constraints;
    }
    return update;
}

class FeatureStrategiesStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('feature-toggle-store.js');
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
        const rows = await this.db<IFeatureStrategiesTable>(TABLE)
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
            .from<IFeatureStrategiesTable>(TABLE);

        stopTimer();
        return rows.map(mapRow);
    }

    async getStrategiesForEnvironment(
        environment: string,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where({ environment })
            .from<IFeatureStrategiesTable>(TABLE);

        stopTimer();
        return rows.map(mapRow);
    }

    async getAllEnabledStrategies(): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where({ enabled: true })
            .from<IFeatureStrategiesTable>(TABLE);

        stopTimer();
        return rows.map(mapRow);
    }

    async getStrategiesForFeature(
        project_name: string,
        feature_name: string,
        environment: string,
    ): Promise<IFeatureStrategy[]> {
        const stopTimer = this.timer('getForFeature');
        const rows = await this.db<IFeatureStrategiesTable>(TABLE).where({
            project_name,
            feature_name,
            environment,
        });
        stopTimer();
        return rows.map(mapRow);
    }

    async getFeatureTogglesClient(): Promise<FeatureConfigurationClient[]> {
        const stopTimer = this.timer('getAllFeatures');
        const rows = await this.db
            .select(
                'features.name as feature_name',
                'features.type as type',
                'features.stale as stale',
                'features.variants as variants',
                'feature_strategies.strategy_name as strategy_name',
                'feature_strategies.parameters as parameters',
                'feature_strategies.constraints as constraints',
                'feature_environments.enabled as enabled',
            )
            .from('features')
            .where({ archived: 0 })
            .fullOuterJoin(
                'feature_strategies',
                'feature_strategies.feature_name',
                `features.name`,
            )
            .fullOuterJoin(
                'feature_environments',
                'feature_environments.feature_name',
                `features.name`,
            );
        stopTimer();
        const groupedByFeature = rows.reduce((acc, r) => {
            if (acc[r.feature_name] !== undefined) {
                acc[r.feature_name].strategies.push(this.getClientStrategy(r));
            } else {
                acc[r.feature_name] = {
                    type: r.type,
                    stale: r.stale,
                    variants: r.variants,
                    name: r.feature_name,
                    enabled: true,
                    strategies: [this.getClientStrategy(r)],
                };
            }
            return acc;
        }, {});
        return Object.values(groupedByFeature);
    }

    p;

    async getProjectOverview(projectId: string): Promise<IFeatureOverview[]> {
        const rows = await this.db('features')
            .where({ project: projectId })
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
            return Object.values(overview);
        }
        throw new NotFoundError(`Could not find project with id ${projectId}`);
    }

    async getStrategyById(id: string): Promise<IFeatureStrategy> {
        return this.db(TABLE)
            .where({ id })
            .first()
            .then(mapRow);
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

    async enableEnvironmentForFeature(
        feature_name: string,
        environment: string,
    ): Promise<void> {
        await this.db('feature_environments')
            .update({ enabled: true })
            .where({ feature_name, environment });
    }

    async updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
    ): Promise<IFeatureStrategy> {
        const update = mapStrategyUpdate(updates);
        const row = await this.db<IFeatureStrategiesTable>(TABLE)
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    private getClientStrategy(r: any): Omit<IStrategyConfig, 'id'> {
        return {
            name: r.strategy_name,
            constraints: r.constraints,
            parameters: r.parameters,
        };
    }

    private getAdminStrategy(r: any): IStrategyConfig {
        return {
            name: r.strategy_name,
            constraints: r.constraints,
            parameters: r.parameters,
            id: r.strategy_id,
        };
    }

    async getStrategiesAndMetadataForEnvironment(
        environment: string,
        featureName: string,
    ): Promise<void> {
        const rows = await this.db('feature_environments')
            .select()
            .join(
                'feature_strategies',
                'feature_environments.feature_name',
                'feature_strategies.feature_name',
            )
            .where('feature_strategies.feature_name', featureName)
            .andWhere('feature_environments.environment', environment);
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
        await this.db('feature_strategies')
            .where({ project_name: projectId, environment })
            .del();
    }
}

module.exports = FeatureStrategiesStore;
export default FeatureStrategiesStore;
