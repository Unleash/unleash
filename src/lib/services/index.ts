import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { IUnleashServices } from '../types/services';
import FeatureTypeService from './feature-type-service';
import EventService from './event-service';
import HealthService from './health-service';

const FeatureToggleService = require('./feature-toggle-service');
const ProjectService = require('./project-service');
const StateService = require('./state-service');
const ClientMetricsService = require('./client-metrics');
const TagTypeService = require('./tag-type-service');
const TagService = require('./tag-service');
const StrategyService = require('./strategy-service');
const AddonService = require('./addon-service');
const ContextService = require('./context-service');
const VersionService = require('./version-service');
const { EmailService } = require('./email-service');
const { AccessService } = require('./access-service');
const { ApiTokenService } = require('./api-token-service');
const UserService = require('./user-service');
const ResetTokenService = require('./reset-token-service');

export const createServices = (
    stores: IUnleashStores,
    config: IUnleashConfig,
): IUnleashServices => {
    const accessService = new AccessService(stores, config);
    const apiTokenService = new ApiTokenService(stores, config);
    const clientMetricsService = new ClientMetricsService(stores, config);
    const contextService = new ContextService(stores, config);
    const emailService = new EmailService(config.email, config.getLogger);
    const eventService = new EventService(stores, config);
    const featureToggleService = new FeatureToggleService(
        stores,
        config,
        accessService,
    );
    const featureTypeService = new FeatureTypeService(stores, config);
    const projectService = new ProjectService(stores, config, accessService);
    const resetTokenService = new ResetTokenService(stores, config);
    const stateService = new StateService(stores, config);
    const strategyService = new StrategyService(stores, config);
    const tagService = new TagService(stores, config);
    const tagTypeService = new TagTypeService(stores, config);
    const addonService = new AddonService(stores, config, tagTypeService);
    const userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
    });
    const versionService = new VersionService(stores, config);
    const healthService = new HealthService(stores, config);

    return {
        accessService,
        addonService,
        featureToggleService,
        featureTypeService,
        healthService,
        projectService,
        stateService,
        strategyService,
        tagTypeService,
        tagService,
        clientMetricsService,
        contextService,
        versionService,
        apiTokenService,
        emailService,
        userService,
        resetTokenService,
        eventService,
    };
};

module.exports = {
    createServices,
};
