const ProjectService = require('./project-service');
const StateService = require('./state-service');
const ClientMetricsService = require('./client-metrics');

module.exports.createServices = (stores, config) => ({
    projectService: new ProjectService(stores, config),
    stateService: new StateService(stores, config),
    clientMetricsService: new ClientMetricsService(stores, config),
});
