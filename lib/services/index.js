const FeatureToggleService = require('./feature-toggle-service');
const ProjectService = require('./project-service');
const StateService = require('./state-service');
const ClientMetricsService = require('./client-metrics');
const TagTypeService = require('./tag-type-service');
const TagService = require('./tag-service');
const StrategyService = require('./strategy-service');
const AddonService = require('./addon-service');
const ContextService = require('./context-service');

module.exports.createServices = (stores, config) => {
    const featureToggleService = new FeatureToggleService(stores, config);
    const projectService = new ProjectService(stores, config);
    const stateService = new StateService(stores, config);
    const strategyService = new StrategyService(stores, config);
    const tagTypeService = new TagTypeService(stores, config);
    const tagService = new TagService(stores, config);
    const clientMetricsService = new ClientMetricsService(stores, config);
    const addonService = new AddonService(stores, config, tagTypeService);
    const contextService = new ContextService(stores, config);

    return {
        addonService,
        featureToggleService,
        projectService,
        stateService,
        strategyService,
        tagTypeService,
        tagService,
        clientMetricsService,
        contextService,
    };
};
