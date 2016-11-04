'use strict';

const METRICS_COLUMNS = ['id', 'created_at', 'metrics'];
const TABLE = 'client_metrics';

module.exports = function (db) {
    // Insert new client metrics
    function insert (metrics) {
        return db(TABLE).insert({ metrics });
    }

    // Used at startup to load all metrics last week into memory!
    function getMetricsLastHour () {
        return db
            .select(METRICS_COLUMNS)
            .from(TABLE)
            .limit(2000)
            .whereRaw('created_at > now() - interval \'1 hour\'')
            .orderBy('created_at', 'asc')
            .map(mapRow);
    }

    // Used to poll for new metrics
    function getNewMetrics (lastKnownId) {
        return db
            .select(METRICS_COLUMNS)
            .from(TABLE)
            .limit(1000)
            .where('id', '>', lastKnownId)
            .orderBy('created_at', 'asc')
            .map(mapRow);
    }

    function mapRow (row) {
        return {
            id: row.id,
            createdAt: row.created_at,
            metrics: row.metrics,
        };
    }

    return { insert, getMetricsLastHour, getNewMetrics };
};
