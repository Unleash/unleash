import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IClientMetric } from '../types/stores/client-metrics-db';

const METRICS_COLUMNS = ['id', 'created_at', 'metrics'];
const TABLE = 'client_metrics';

const ONE_MINUTE = 60 * 1000;

const mapRow = (row) => ({
    id: row.id,
    createdAt: row.created_at,
    metrics: row.metrics,
});

export class ClientMetricsDb {
    private readonly logger: Logger;

    private readonly timer: NodeJS.Timeout;

    constructor(private db: Knex, getLogger: LogProvider) {
        this.logger = getLogger('client-metrics-db.js');

        // Clear old metrics regularly
        const clearer = () => this.removeMetricsOlderThanOneHour();
        setTimeout(clearer, 10).unref();
        this.timer = setInterval(clearer, ONE_MINUTE).unref();
    }

    async removeMetricsOlderThanOneHour(): Promise<void> {
        try {
            const rows = await this.db(TABLE)
                .whereRaw("created_at < now() - interval '1 hour'")
                .del();
            if (rows > 0) {
                this.logger.debug(`Deleted ${rows} metrics`);
            }
        } catch (e) {
            this.logger.warn(`Error when deleting metrics ${e}`);
        }
    }

    async delete(id: number): Promise<void> {
        await this.db(TABLE).where({ id }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    // Insert new client metrics
    async insert(metrics: IClientMetric): Promise<void> {
        return this.db(TABLE).insert({ metrics });
    }

    // Used at startup to load all metrics last week into memory!
    async getMetricsLastHour(): Promise<IClientMetric[]> {
        try {
            const result = await this.db
                .select(METRICS_COLUMNS)
                .from(TABLE)
                .limit(2000)
                .whereRaw("created_at > now() - interval '1 hour'")
                .orderBy('created_at', 'asc');
            return result.map(mapRow);
        } catch (e) {
            this.logger.warn(`error when getting metrics last hour ${e}`);
        }
        return [];
    }

    async get(id: number): Promise<IClientMetric> {
        const result = await this.db
            .select(METRICS_COLUMNS)
            .from(TABLE)
            .where({ id })
            .first();
        return mapRow(result);
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    // Used to poll for new metrics
    async getNewMetrics(lastKnownId: number): Promise<IClientMetric[]> {
        try {
            const res = await this.db
                .select(METRICS_COLUMNS)
                .from(TABLE)
                .limit(1000)
                .where('id', '>', lastKnownId)
                .orderBy('created_at', 'asc');
            return res.map(mapRow);
        } catch (e) {
            this.logger.warn(`error when getting new metrics ${e}`);
        }
        return [];
    }

    destroy(): void {
        clearInterval(this.timer);
    }
}
