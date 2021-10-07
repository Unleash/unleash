/* eslint-disable @typescript-eslint/no-unused-vars */
import util from 'util';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import {
    IClientMetricsEnv,
    IClientMetricsEnvKey,
    IClientMetricsStoreV2,
} from '../types/stores/client-metrics-store-v2';
import NotFoundError from '../error/notfound-error';

interface ClientMetricsEnvTable {
    feature_name: string;
    app_name: string;
    environment: string;
    timestamp: Date;
    yes: number;
    no: number;
}

const TABLE = 'client_metrics_env';

// Unsure if this would be better be done by the service?
export function roundDownToHour(date: Date): Date {
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

    async get(key: IClientMetricsEnvKey): Promise<IClientMetricsEnv> {
        const row = await this.db<ClientMetricsEnvTable>(TABLE)
            .where({
                feature_name: key.featureName,
                app_name: key.appName,
                environment: key.environment,
                timestamp: roundDownToHour(key.timestamp),
            })
            .first();
        if (row) {
            return fromRow(row);
        }
        throw new NotFoundError(`Could not find metric`);
    }

    async getAll(query: Object = {}): Promise<IClientMetricsEnv[]> {
        const rows = await this.db<ClientMetricsEnvTable>(TABLE)
            .select('*')
            .where(query);
        return rows.map(fromRow);
    }

    async exists(key: IClientMetricsEnvKey): Promise<boolean> {
        try {
            await this.get(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    async delete(key: IClientMetricsEnvKey): Promise<void> {
        return this.db<ClientMetricsEnvTable>(TABLE)
            .where({
                feature_name: key.featureName,
                app_name: key.appName,
                environment: key.environment,
                timestamp: roundDownToHour(key.timestamp),
            })
            .del();
    }

    deleteAll(): Promise<void> {
        return this.db(TABLE).del();
    }

    destroy(): void {
        // Nothing to do!
    }

    // this function will collapse metrics before sending it to the database.
    async batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void> {
        if (!metrics || metrics.length == 0) {
            return;
        }
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

    async getSeenAppsForFeatureToggle(
        featureName: string,
        hoursBack: number = 24,
    ): Promise<string[]> {
        return this.db<ClientMetricsEnvTable>(TABLE)
            .distinct()
            .where({ feature_name: featureName })
            .andWhereRaw(`timestamp >= NOW() - INTERVAL '${hoursBack} hours'`)
            .pluck('app_name')
            .orderBy('app_name');
    }

    async clearMetrics(hoursAgo: number): Promise<void> {
        return this.db<ClientMetricsEnvTable>(TABLE)
            .whereRaw(`timestamp <= NOW() - INTERVAL '${hoursAgo} hours'`)
            .del();
    }
}
