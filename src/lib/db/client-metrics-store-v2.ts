/* eslint-disable @typescript-eslint/no-unused-vars */
import util from 'util';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import {
    IClientMetricsEnv,
    IClientMetricsEnvKey,
    IClientMetricsStoreV2,
} from '../types/stores/client-metrics-store-v2';

interface ClientMetricsEnvTable {
    feature_name: string;
    app_name: string;
    environment: string;
    timestamp: Date;
    yes: number;
    no: number;
}

const TABLE = 'client_metrics_env';

function roundDownToHour(date) {
    let p = 60 * 60 * 1000; // milliseconds in an hour
    return new Date(Math.floor(date.getTime() / p) * p);
}

const fromRow = (row: ClientMetricsEnvTable) => ({
    featureName: row.feature_name,
    appName: row.app_name,
    environment: row.environment,
    timestamp: row.timestamp,
    yes: row.yes,
    no: row.no,
});

const toRow = (metric: IClientMetricsEnv) => ({
    feature_name: metric.featureName,
    app_name: metric.appName,
    environment: metric.environment,
    timestamp: roundDownToHour(metric.timestamp),
    yes: metric.yes,
    no: metric.no,
});

export class ClientMetricsStoreV2 implements IClientMetricsStoreV2 {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('client-metrics-store-v2.js');
    }

    get(key: IClientMetricsEnvKey): Promise<IClientMetricsEnv> {
        throw new Error('Method not implemented.');
    }

    async getAll(query: Object = {}): Promise<IClientMetricsEnv[]> {
        const rows = await this.db<ClientMetricsEnvTable>(TABLE)
            .select('*')
            .where(query);
        return rows.map(fromRow);
    }

    exists(key: IClientMetricsEnvKey): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    delete(key: IClientMetricsEnvKey): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    destroy(): void {
        // Nothing to do!
    }

    // this function will collapse metrics before sending it to the database.
    async batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void> {
        const rows = metrics.map(toRow);

        const batch = rows.reduce((prev, curr) => {
            // eslint-disable-next-line prettier/prettier
            const key = `${curr.feature_name}_${curr.app_name}_${curr.environment}_${curr.timestamp.getTime()}`;
            if (prev[key]) {
                prev[key].yes += curr.yes;
                prev[key].no += curr.no;
            } else {
                prev[key] = curr;
            }
            return prev;
        }, {});

        // Consider rewriting to SQL batch!
        const insert = this.db<ClientMetricsEnvTable>(TABLE)
            .insert(Object.values(batch))
            .toQuery();

        const query = `${insert.toString()} ON CONFLICT (feature_name, app_name, environment, timestamp) DO UPDATE SET "yes" = "client_metrics_env"."yes" + EXCLUDED.yes, "no" = "client_metrics_env"."no" + EXCLUDED.no`;
        await this.db.raw(query);
    }

    async getMetricsForFeatureToggle(
        featureName: string,
        hoursBack: number = 24,
    ): Promise<IClientMetricsEnv[]> {
        const rows = await this.db<ClientMetricsEnvTable>(TABLE)
            .select('*')
            .where({ feature_name: featureName })
            .andWhereRaw(`timestamp >= NOW() - INTERVAL '${hoursBack} hours'`);
        return rows.map(fromRow);
    }
}
