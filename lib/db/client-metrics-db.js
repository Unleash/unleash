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
        setInterval(clearer, ONE_MINUTE).unref();
    }

    removeMetricsOlderThanOneHour() {
        this.db(TABLE)
            .whereRaw("created_at < datetime('now', '-1 hour')")
            .del()
            .then(res => res > 0 && this.logger.info(`Deleted ${res} metrics`));
    }

    // Insert new client metrics
    insert(metrics) {
        return this.db(TABLE).insert({ metrics });
    }

    // Used at startup to load all metrics last week into memory!
    getMetricsLastHour() {
        return this.db
            .select(METRICS_COLUMNS)
            .from(TABLE)
            .limit(2000)
            .whereRaw("created_at > datetime('now', '-1 hour')")
            .orderBy('created_at', 'asc')
            .map(mapRow);
    }

    // Used to poll for new metrics
    getNewMetrics(lastKnownId) {
        return this.db
            .select(METRICS_COLUMNS)
            .from(TABLE)
            .limit(1000)
            .where('id', '>', lastKnownId)
            .orderBy('created_at', 'asc')
            .map(mapRow);
    }
}

module.exports = ClientMetricsDb;
