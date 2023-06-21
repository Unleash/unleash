import { Logger, LogProvider } from '../logger';
import {
    IClientMetricsEnv,
    IClientMetricsEnvKey,
    IClientMetricsEnvVariant,
    IClientMetricsStoreV2,
} from '../types/stores/client-metrics-store-v2';
import NotFoundError from '../error/notfound-error';
import { startOfHour } from 'date-fns';
import {
    collapseHourlyMetrics,
    spreadVariants,
} from '../util/collapseHourlyMetrics';
import { Db } from './db';
import { IFlagResolver } from '../types';

interface ClientMetricsBaseTable {
    feature_name: string;
    app_name: string;
    environment: string;
    timestamp: Date;
}

interface ClientMetricsEnvTable extends ClientMetricsBaseTable {
    yes: number;
    no: number;
}

interface ClientMetricsEnvVariantTable extends ClientMetricsBaseTable {
    variant: string;
    count: number;
}

const TABLE = 'client_metrics_env';
const TABLE_VARIANTS = 'client_metrics_env_variants';

const fromRow = (row: ClientMetricsEnvTable) => ({
    featureName: row.feature_name,
    appName: row.app_name,
    environment: row.environment,
    timestamp: row.timestamp,
    yes: Number(row.yes),
    no: Number(row.no),
});

const toRow = (metric: IClientMetricsEnv): ClientMetricsEnvTable => ({
    feature_name: metric.featureName,
    app_name: metric.appName,
    environment: metric.environment,
    timestamp: startOfHour(metric.timestamp),
    yes: metric.yes,
    no: metric.no,
});

const toVariantRow = (
    metric: IClientMetricsEnvVariant,
): ClientMetricsEnvVariantTable => ({
    feature_name: metric.featureName,
    app_name: metric.appName,
    environment: metric.environment,
    timestamp: startOfHour(metric.timestamp),
    variant: metric.variant,
    count: metric.count,
});

const variantRowReducer = (acc, tokenRow) => {
    const {
        feature_name: featureName,
        app_name: appName,
        environment,
        timestamp,
        yes,
        no,
        variant,
        count,
    } = tokenRow;
    const key = `${featureName}_${appName}_${environment}_${timestamp}_${yes}_${no}`;
    if (!acc[key]) {
        acc[key] = {
            featureName,
            appName,
            environment,
            timestamp,
            yes: Number(yes),
            no: Number(no),
            variants: {},
        };
    }
    if (variant) {
        acc[key].variants[variant] = count;
    }

    return acc;
};

export class ClientMetricsStoreV2 implements IClientMetricsStoreV2 {
    private db: Db;

    private logger: Logger;

    private flagResolver: IFlagResolver;

    constructor(db: Db, getLogger: LogProvider, flagResolver: IFlagResolver) {
        this.db = db;
        this.logger = getLogger('client-metrics-store-v2.js');
        this.flagResolver = flagResolver;
    }

    async get(key: IClientMetricsEnvKey): Promise<IClientMetricsEnv> {
        const row = await this.db<ClientMetricsEnvTable>(TABLE)
            .where({
                feature_name: key.featureName,
                app_name: key.appName,
                environment: key.environment,
                timestamp: startOfHour(key.timestamp),
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
                timestamp: startOfHour(key.timestamp),
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
        const rows = collapseHourlyMetrics(metrics).map(toRow);

        // Sort the rows to avoid deadlocks
        const sortedRows = rows.sort(
            (a, b) =>
                a.feature_name.localeCompare(b.feature_name) ||
                a.app_name.localeCompare(b.app_name) ||
                a.environment.localeCompare(b.environment),
        );

        // Consider rewriting to SQL batch!
        const insert = this.db<ClientMetricsEnvTable>(TABLE)
            .insert(sortedRows)
            .toQuery();
        const query = `${insert.toString()} ON CONFLICT (feature_name, app_name, environment, timestamp) DO UPDATE SET "yes" = "client_metrics_env"."yes" + EXCLUDED.yes, "no" = "client_metrics_env"."no" + EXCLUDED.no`;
        await this.db.raw(query);

        const variantRows = spreadVariants(metrics).map(toVariantRow);
        if (variantRows.length > 0) {
            const insertVariants = this.db<ClientMetricsEnvVariantTable>(
                TABLE_VARIANTS,
            )
                .insert(variantRows)
                .toQuery();
            const variantsQuery = `${insertVariants.toString()} ON CONFLICT (feature_name, app_name, environment, timestamp, variant) DO UPDATE SET "count" = "client_metrics_env_variants"."count" + EXCLUDED.count`;
            await this.db.raw(variantsQuery);
        }
    }

    async getMetricsForFeatureToggle(
        featureName: string,
        hoursBack: number = 24,
    ): Promise<IClientMetricsEnv[]> {
        const rows = await this.db<ClientMetricsEnvTable>(TABLE)
            .select([`${TABLE}.*`, 'variant', 'count'])
            .leftJoin(TABLE_VARIANTS, function () {
                this.on(
                    `${TABLE_VARIANTS}.feature_name`,
                    `${TABLE}.feature_name`,
                )
                    .on(`${TABLE_VARIANTS}.app_name`, `${TABLE}.app_name`)
                    .on(`${TABLE_VARIANTS}.environment`, `${TABLE}.environment`)
                    .on(`${TABLE_VARIANTS}.timestamp`, `${TABLE}.timestamp`);
            })
            .where(`${TABLE}.feature_name`, featureName)
            .andWhereRaw(
                `${TABLE}.timestamp >= NOW() - INTERVAL '${hoursBack} hours'`,
            );

        const tokens = rows.reduce(variantRowReducer, {});
        return Object.values(tokens);
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

    async getSeenTogglesForApp(
        appName: string,
        hoursBack: number = 24,
    ): Promise<string[]> {
        return this.db<ClientMetricsEnvTable>(TABLE)
            .distinct()
            .where({ app_name: appName })
            .andWhereRaw(`timestamp >= NOW() - INTERVAL '${hoursBack} hours'`)
            .pluck('feature_name')
            .orderBy('feature_name');
    }

    async clearMetrics(hoursAgo: number): Promise<void> {
        return this.db<ClientMetricsEnvTable>(TABLE)
            .whereRaw(`timestamp <= NOW() - INTERVAL '${hoursAgo} hours'`)
            .del();
    }
}
