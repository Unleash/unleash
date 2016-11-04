'use strict';

const METRICS_COLUMNS = ['id', 'created_at', 'metrics'];
const TABLE = 'client_metrics';

module.exports = function (db) {
    // Insert new client metrics
    function insert (metrics) {
        return db(TABLE).insert({ metrics });
    }

    // Used at startup to load all metrics last week into memory!
    function getMetricsLastWeek () {
        return db
            .select(METRICS_COLUMNS)
            .from(TABLE)
            .whereRaw('created_at > now() - interval \'7 day\'')
            .orderBy('created_at', 'asc')
            .map(mapRow);
    }

    // Used to poll for new metrics
    function getNewMetrics (lastKnownId) {
        return db
            .select(METRICS_COLUMNS)
            .from(TABLE)
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

    return { insert, getMetricsLastWeek, getNewMetrics };
};
