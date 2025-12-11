import type { LogProvider } from '../../../logger.js';
import type {
    IClientMetricsEnv,
    IClientMetricsEnvKey,
    IClientMetricsEnvVariant,
    IClientMetricsStoreV2,
} from './client-metrics-store-v2-type.js';
import NotFoundError from '../../../error/notfound-error.js';
import { endOfDay, startOfHour } from 'date-fns';
import {
    collapseHourlyMetrics,
    spreadVariants,
} from './collapseHourlyMetrics.js';
import type { Db } from '../../../db/db.js';
import type { IFlagResolver } from '../../../types/index.js';
import metricsHelper from '../../../util/metrics-helper.js';
import { DB_TIME } from '../../../metric-events.js';
import type EventEmitter from 'events';

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

const HOURLY_TABLE = 'client_metrics_env';
const DAILY_TABLE = 'client_metrics_env_daily';
const HOURLY_TABLE_VARIANTS = 'client_metrics_env_variants';
const DAILY_TABLE_VARIANTS = 'client_metrics_env_variants_daily';

const FEATURES_TABLE = 'features';

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

const variantRowReducerV2 = (acc, tokenRow) => {
    const {
        feature_name: featureName,
        app_name: appName,
        environment,
        timestamp,
        date,
        yes,
        no,
        variant,
        count,
    } = tokenRow;
    const key = `${featureName}_${appName}_${environment}_${
        timestamp || date
    }_${yes}_${no}`;
    if (!acc[key]) {
        acc[key] = {
            featureName,
            appName,
            environment,
            timestamp: timestamp || endOfDay(date),
            yes: Number(yes),
            no: Number(no),
            variants: {},
        };
    }
    if (variant) {
        acc[key].variants[variant] = Number(count);
    }

    return acc;
};

export class ClientMetricsStoreV2 implements IClientMetricsStoreV2 {
    private db: Db;

    private metricTimer: Function;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        _getLogger: LogProvider,
        _flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.metricTimer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'client-metrics',
                action,
            });
    }

    async get(key: IClientMetricsEnvKey): Promise<IClientMetricsEnv> {
        const row = await this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
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

    //TODO: Consider moving this to a specific feature store
    async getFeatureFlagNames(): Promise<string[]> {
        return this.db(FEATURES_TABLE).distinct('name').pluck('name');
    }

    async getAll(query: Object = {}): Promise<IClientMetricsEnv[]> {
        const rows = await this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
            .select('*')
            .where(query);
        return rows.map(fromRow);
    }

    async exists(key: IClientMetricsEnvKey): Promise<boolean> {
        try {
            await this.get(key);
            return true;
        } catch (_e) {
            return false;
        }
    }

    async delete(key: IClientMetricsEnvKey): Promise<void> {
        return this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
            .where({
                feature_name: key.featureName,
                app_name: key.appName,
                environment: key.environment,
                timestamp: startOfHour(key.timestamp),
            })
            .del();
    }

    deleteAll(): Promise<void> {
        return this.db(HOURLY_TABLE).del();
    }

    destroy(): void {
        // Nothing to do!
    }

    // this function will collapse metrics before sending it to the database.
    async batchInsertMetrics(metrics: IClientMetricsEnv[]): Promise<void> {
        if (!metrics || metrics.length === 0) {
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
        const insert = this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
            .insert(sortedRows)
            .toQuery();
        const query = `${insert.toString()} ON CONFLICT (feature_name, app_name, environment, timestamp) DO UPDATE SET "yes" = "client_metrics_env"."yes" + EXCLUDED.yes, "no" = "client_metrics_env"."no" + EXCLUDED.no`;
        await this.db.raw(query);

        const variantRows = spreadVariants(metrics).map(toVariantRow);

        // Sort the rows to avoid deadlocks
        const sortedVariantRows = variantRows.sort(
            (a, b) =>
                a.feature_name.localeCompare(b.feature_name) ||
                a.app_name.localeCompare(b.app_name) ||
                a.environment.localeCompare(b.environment) ||
                a.variant.localeCompare(b.variant),
        );

        if (sortedVariantRows.length > 0) {
            const insertVariants = this.db<ClientMetricsEnvVariantTable>(
                HOURLY_TABLE_VARIANTS,
            )
                .insert(sortedVariantRows)
                .toQuery();
            const variantsQuery = `${insertVariants.toString()} ON CONFLICT (feature_name, app_name, environment, timestamp, variant) DO UPDATE SET "count" = "client_metrics_env_variants"."count" + EXCLUDED.count`;
            await this.db.raw(variantsQuery);
        }
    }

    async getMetricsForFeatureToggle(
        featureName: string,
        hoursBack: number = 24,
    ): Promise<IClientMetricsEnv[]> {
        const rows = await this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
            .select([`${HOURLY_TABLE}.*`, 'variant', 'count'])
            .leftJoin(HOURLY_TABLE_VARIANTS, function () {
                this.on(
                    `${HOURLY_TABLE_VARIANTS}.feature_name`,
                    `${HOURLY_TABLE}.feature_name`,
                )
                    .on(
                        `${HOURLY_TABLE_VARIANTS}.app_name`,
                        `${HOURLY_TABLE}.app_name`,
                    )
                    .on(
                        `${HOURLY_TABLE_VARIANTS}.environment`,
                        `${HOURLY_TABLE}.environment`,
                    )
                    .on(
                        `${HOURLY_TABLE_VARIANTS}.timestamp`,
                        `${HOURLY_TABLE}.timestamp`,
                    );
            })
            .where(`${HOURLY_TABLE}.feature_name`, featureName)
            .andWhereRaw(
                `${HOURLY_TABLE}.timestamp >= NOW() - INTERVAL '${hoursBack} hours'`,
            );

        const tokens = rows.reduce(variantRowReducer, {});
        return Object.values(tokens);
    }

    async getMetricsForFeatureToggleV2(
        featureName: string,
        hoursBack: number = 24,
    ): Promise<IClientMetricsEnv[]> {
        const mainTable = hoursBack <= 48 ? HOURLY_TABLE : DAILY_TABLE;
        const variantsTable =
            hoursBack <= 48 ? HOURLY_TABLE_VARIANTS : DAILY_TABLE_VARIANTS;
        const dateTime = hoursBack <= 48 ? 'timestamp' : 'date';

        const rows = await this.db<ClientMetricsEnvTable>(mainTable)
            .select([`${mainTable}.*`, 'variant', 'count'])
            .leftJoin(variantsTable, function () {
                this.on(
                    `${variantsTable}.feature_name`,
                    `${mainTable}.feature_name`,
                )
                    .on(`${variantsTable}.app_name`, `${mainTable}.app_name`)
                    .on(
                        `${variantsTable}.environment`,
                        `${mainTable}.environment`,
                    )
                    .on(
                        `${variantsTable}.${dateTime}`,
                        `${mainTable}.${dateTime}`,
                    );
            })
            .where(`${mainTable}.feature_name`, featureName)
            .andWhereRaw(
                `${mainTable}.${dateTime} >= NOW() - INTERVAL '${hoursBack} hours'`,
            );

        const tokens = rows.reduce(variantRowReducerV2, {});
        return Object.values(tokens);
    }

    async getSeenAppsForFeatureToggle(
        featureName: string,
        hoursBack: number = 24,
    ): Promise<string[]> {
        return this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
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
        return this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
            .distinct()
            .where({ app_name: appName })
            .andWhereRaw(`timestamp >= NOW() - INTERVAL '${hoursBack} hours'`)
            .pluck('feature_name')
            .orderBy('feature_name');
    }

    async clearMetrics(hoursAgo: number): Promise<void> {
        return this.db<ClientMetricsEnvTable>(HOURLY_TABLE)
            .whereRaw(`timestamp <= NOW() - INTERVAL '${hoursAgo} hours'`)
            .del();
    }

    async clearDailyMetrics(daysAgo: number): Promise<void> {
        return this.db(DAILY_TABLE)
            .whereRaw(`date <= CURRENT_DATE - INTERVAL '${daysAgo} days'`)
            .del();
    }

    async countPreviousDayHourlyMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }> {
        const enabledCountQuery = this.db(HOURLY_TABLE)
            .whereRaw("timestamp >= CURRENT_DATE - INTERVAL '1 day'")
            .andWhereRaw('timestamp < CURRENT_DATE')
            .count()
            .first();
        const variantCountQuery = this.db(HOURLY_TABLE_VARIANTS)
            .whereRaw("timestamp >= CURRENT_DATE - INTERVAL '1 day'")
            .andWhereRaw('timestamp < CURRENT_DATE')
            .count()
            .first();
        const [enabledCount, variantCount] = await Promise.all([
            enabledCountQuery,
            variantCountQuery,
        ]);
        return {
            enabledCount: Number(enabledCount?.count || 0),
            variantCount: Number(variantCount?.count || 0),
        };
    }

    async countPreviousDayMetricsBuckets(): Promise<{
        enabledCount: number;
        variantCount: number;
    }> {
        const enabledCountQuery = this.db(DAILY_TABLE)
            .whereRaw("date >= CURRENT_DATE - INTERVAL '1 day'")
            .andWhereRaw('date < CURRENT_DATE')
            .count()
            .first();
        const variantCountQuery = this.db(DAILY_TABLE_VARIANTS)
            .whereRaw("date >= CURRENT_DATE - INTERVAL '1 day'")
            .andWhereRaw('date < CURRENT_DATE')
            .count()
            .first();
        const [enabledCount, variantCount] = await Promise.all([
            enabledCountQuery,
            variantCountQuery,
        ]);
        return {
            enabledCount: Number(enabledCount?.count || 0),
            variantCount: Number(variantCount?.count || 0),
        };
    }

    // aggregates all hourly metrics from a previous day into daily metrics
    async aggregateDailyMetrics(): Promise<void> {
        const stopTimer = this.metricTimer('aggregateDailyMetrics');
        const rawQuery: string = `
          INSERT INTO ${DAILY_TABLE} (feature_name, app_name, environment, date, yes, no)
          SELECT
              feature_name,
              app_name,
              environment,
              CURRENT_DATE - INTERVAL '1 day' as date,
              SUM(yes) as yes,
              SUM(no) as no
          FROM
              ${HOURLY_TABLE}
          WHERE
              timestamp >= CURRENT_DATE - INTERVAL '1 day'
              AND timestamp < CURRENT_DATE
          GROUP BY
              feature_name, app_name, environment
          ON CONFLICT (feature_name, app_name, environment, date)
          DO UPDATE SET yes = EXCLUDED.yes, no = EXCLUDED.no;
        `;
        const rawVariantsQuery: string = `
          INSERT INTO ${DAILY_TABLE_VARIANTS} (feature_name, app_name, environment, date, variant, count)
          SELECT
              feature_name,
              app_name,
              environment,
              CURRENT_DATE - INTERVAL '1 day' as date,
              variant,
              SUM(count) as count
          FROM
              ${HOURLY_TABLE_VARIANTS}
          WHERE
              timestamp >= CURRENT_DATE - INTERVAL '1 day'
              AND timestamp < CURRENT_DATE
          GROUP BY
              feature_name, app_name, environment, variant
          ON CONFLICT (feature_name, app_name, environment, date, variant)
          DO UPDATE SET count = EXCLUDED.count;
        `;

        // have to be run serially since variants table has FK on yes/no metrics
        await this.db.raw(rawQuery);
        await this.db.raw(rawVariantsQuery);
        stopTimer();
    }
}
