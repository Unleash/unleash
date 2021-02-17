'use strict';

const METRICS_COLUMNS = ['id', 'created_at', 'metrics'];
const TABLE = 'client_metrics';

const ONE_MINUTE = 60 * 1000;

const mapRow = row => ({
    id: row.id,
    createdAt: row.created_at,
    metrics: row.metrics,
});

class ClientMetricsDb {
    constructor(db, getLogger) {
        this.db = db;
        this.logger = getLogger('client-metrics-db.js');

        // Clear old metrics regulary
        const clearer = () => this.removeMetricsOlderThanOneHour();
        setTimeout(clearer, 10).unref();
        this.timer = setInterval(clearer, ONE_MINUTE).unref();
    }

    async removeMetricsOlderThanOneHour() {
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

    // Insert new client metrics
    async insert(metrics) {
        return this.db(TABLE).insert({ metrics });
    }

    // Used at startup to load all metrics last week into memory!
    async getMetricsLastHour() {
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

    // Used to poll for new metrics
    async getNewMetrics(lastKnownId) {
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

    destroy() {
        clearInterval(this.timer);
    }
}

module.exports = ClientMetricsDb;
