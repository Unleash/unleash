const FeatureToggleService = require('./feature-toggle-service');
const ProjectService = require('./project-service');
const StateService = require('./state-service');
const ClientMetricsService = require('./client-metrics');
const TagTypeService = require('./tag-type-service');
const TagService = require('./tag-service');
const StrategyService = require('./strategy-service');

module.exports.createServices = (stores, config) => ({
    featureToggleService: new FeatureToggleService(stores, config),
    projectService: new ProjectService(stores, config),
    stateService: new StateService(stores, config),
    strategyService: new StrategyService(stores, config),
    tagTypeService: new TagTypeService(stores, config),
    tagService: new TagService(stores, config),
    clientMetricsService: new ClientMetricsService(stores, config),
});
