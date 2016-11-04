'use strict';
const clientInstancesDbCreator = require('./client-instances');
const clientMetricsDbCreator = require('./client-metrics');
const clientStrategiesDbCreator = require('./client-strategies');

module.exports = (db) => ({
    clientInstancesDb: clientInstancesDbCreator(db),
    clientMetricsDb: clientMetricsDbCreator(db),
    clientStrategiesDb: clientStrategiesDbCreator(db),
});
