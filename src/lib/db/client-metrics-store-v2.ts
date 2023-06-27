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
import { PerformanceProfile } from '../services/client-metrics/schema';

interface ClientMetricsBaseTable {
    feature_name: string;
    app_name: string;
    environment: string;
    timestamp: Date;
}

interface ClientMetricsEnvTable extends ClientMetricsBaseTable {
    yes: number;
    no: number;
    enabled_execution_time: number;
    disabled_execution_time: number;
    enabled_execution_count: number;
    disabled_execution_count: number;
    enabled_error_count: number;
    disabled_error_count: number;
}

interface ClientMetricsEnvVariantTable extends ClientMetricsBaseTable {
    variant: string;
    count: number;
}

export interface ClientEnvPerformanceMetrics {
    appName: string;
    environment: string;
    cpu: number;
    memory: MemoryMetric;
    timestamp: Date;
}

interface ClientEnvPerformanceMetricsRow
    extends Omit<ClientMetricsBaseTable, 'feature_name'> {
    cpu: number;
    total_memory: string;
    heap_total: string;
    heap_used: string;
    external: string;
}

export interface MemoryMetric {
    totalMemoryAllocated: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
}

const TABLE = 'client_metrics_env';
const TABLE_VARIANTS = 'client_metrics_env_variants';
const TABLE_PERFORMANCE = 'client_metrics_env_performance';

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

    enabled_execution_time: metric.enabledExecutionTime,
    disabled_execution_time: metric.disabledExecutionTime,
    enabled_execution_count: metric.enabledExecutionCount,
    disabled_execution_count: metric.disabledExecutionCount,
    enabled_error_count: metric.enabledErrorCount,
    disabled_error_count: metric.disabledErrorCount,
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
        enabled_execution_time: enabledExecutionTime,
        disabled_execution_time: disabledExecutionTime,
        enabled_execution_count: enabledExecutionCount,
        disabled_execution_count: disabledExecutionCount,
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
            enabledExecutionTime: Number(enabledExecutionTime),
            disabledExecutionTime: Number(disabledExecutionTime),
            enabledExecutionCount: Number(enabledExecutionCount),
            disabledExecutionCount: Number(disabledExecutionCount),
        };
    }
    if (variant) {
        acc[key].variants[variant] = count;
    }

    return acc;
};

const fromPerformanceRow = (
    row: ClientEnvPerformanceMetricsRow,
): ClientEnvPerformanceMetrics => ({
    appName: row.app_name,
    environment: row.environment,
    cpu: row.cpu,
    memory: {
        external: row.external,
        heapTotal: row.heap_total,
        heapUsed: row.heap_used,
        totalMemoryAllocated: row.total_memory,
    },
    timestamp: row.timestamp,
});

const toPerformanceRow = (
    metric: ClientEnvPerformanceMetrics,
): ClientEnvPerformanceMetricsRow => ({
    cpu: metric.cpu,
    heap_used: metric.memory.heapUsed,
    heap_total: metric.memory.heapTotal,
    total_memory: metric.memory.totalMemoryAllocated,
    external: metric.memory.external,
    app_name: metric.appName,
    environment: metric.environment,
    timestamp: metric.timestamp,
});

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
        const query =
            `${insert.toString()} ON CONFLICT (feature_name, app_name, environment, timestamp) DO UPDATE SET "yes" = "client_metrics_env"."yes" + EXCLUDED.yes, "no" = "client_metrics_env"."no" + EXCLUDED.no` +
            `, "enabled_execution_time" = COALESCE("client_metrics_env"."enabled_execution_time", 0) + EXCLUDED.enabled_execution_time` +
            `, "disabled_execution_time" = COALESCE("client_metrics_env"."disabled_execution_time", 0) + EXCLUDED.disabled_execution_time` +
            `, "enabled_execution_count" = COALESCE("client_metrics_env"."enabled_execution_count", 0) + EXCLUDED.enabled_execution_count` +
            `, "disabled_execution_count" = COALESCE("client_metrics_env"."disabled_execution_count", 0) + EXCLUDED.disabled_execution_count` +
            `, "enabled_error_count" = COALESCE("client_metrics_env"."enabled_error_count", 0) + EXCLUDED.enabled_error_count` +
            `, "disabled_error_count" = COALESCE("client_metrics_env"."disabled_error_count", 0) + EXCLUDED.disabled_error_count`;

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

    async getPerformanceMetrics(
        appName: string,
        environment: string,
        hoursBack: number,
    ): Promise<ClientEnvPerformanceMetrics[]> {
        const rows = await this.db<ClientEnvPerformanceMetricsRow>(
            TABLE_PERFORMANCE,
        )
            .where({ app_name: appName, environment })
            .andWhereRaw(`timestamp >= NOW() - INTERVAL '${hoursBack} hours'`)
            .select('*');

        return rows.map(fromPerformanceRow);
    }

    async insertPerformanceMetric(
        appName: string,
        environment: string,
        metric: PerformanceProfile,
    ): Promise<void> {
        await this.db(TABLE_PERFORMANCE).insert(
            toPerformanceRow({
                timestamp: new Date(),
                appName,
                environment,
                ...metric,
            }),
        );
    }
}
