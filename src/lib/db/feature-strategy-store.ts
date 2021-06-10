import { Knex } from 'knex';
import EventEmitter from 'events';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';

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
    id: number;
    feature_name: string;
    project: string;
    enabled: boolean;
    environment: string;
    strategy_name: string;
    parameters: JSON;
    constraints: JSON;
    created_at: Date;
}

export interface IFeatureStrategies {
    id: number;
    featureName: string;
    project: string;
    enabled: boolean;
    environment: string;
    strategyName: string;
    parameters: JSON;
    constraints: JSON;
    createdAt: Date;
}

function mapRows(row: IFeatureStrategiesTable): IFeatureStrategies {
    return {
        id: row.id,
        featureName: row.feature_name,
        project: row.project,
        enabled: row.enabled,
        environment: row.environment,
        strategyName: row.strategy_name,
        parameters: row.parameters,
        constraints: row.constraints,
        createdAt: row.created_at,
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

    async getStrategiesForToggle(
        featureName: string,
    ): Promise<IFeatureStrategies[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where('feature_name', featureName)
            .from<IFeatureStrategiesTable>(TABLE);

        stopTimer();
        return rows.map(mapRows);
    }

    async getStrategiesForEnvironment(
        environment: string,
    ): Promise<IFeatureStrategies[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where({ environment })
            .from<IFeatureStrategiesTable>(TABLE);

        stopTimer();
        return rows.map(mapRows);
    }

    async getAllEnabledStrategies(): Promise<IFeatureStrategies[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where({ enabled: true })
            .from<IFeatureStrategiesTable>(TABLE);

        stopTimer();
        return rows.map(mapRows);
    }
}

module.exports = FeatureStrategiesStore;
export default FeatureStrategiesStore;
