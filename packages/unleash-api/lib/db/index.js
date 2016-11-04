'use strict';
const eventDbCreator = require('./event');
const clientInstancesDbCreator = require('./client-instances');
const clientMetricsDbCreator = require('./client-metrics');
const clientStrategiesDbCreator = require('./client-strategies');

module.exports = (db) => ({
    eventDb: eventDbCreator(db),
    clientInstancesDb: clientInstancesDbCreator(db),
    clientMetricsDb: clientMetricsDbCreator(db),
    clientStrategiesDb: clientStrategiesDbCreator(db),
});
