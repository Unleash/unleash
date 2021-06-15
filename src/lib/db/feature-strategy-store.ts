import { Knex } from 'knex';
import EventEmitter from 'events';
import * as uuid from 'uuid';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import { IConstraint } from '../types/model';

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

class FeatureStrategiesStore {
    private db: Knex;

    private logger: Logger;

    private timer: Function;

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
}

module.exports = FeatureStrategiesStore;
export default FeatureStrategiesStore;
