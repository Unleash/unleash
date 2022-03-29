import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { IUnleashServices } from '../types/services';
import FeatureTypeService from './feature-type-service';
import EventService from './event-service';
import HealthService from './health-service';

import ProjectService from './project-service';
import StateService from './state-service';
import ClientInstanceService from './client-metrics/instance-service';
import ClientMetricsServiceV2 from './client-metrics/metrics-service-v2';
import TagTypeService from './tag-type-service';
import TagService from './tag-service';
import StrategyService from './strategy-service';
import AddonService from './addon-service';
import ContextService from './context-service';
import VersionService from './version-service';
import { EmailService } from './email-service';
import { AccessService } from './access-service';
import { ApiTokenService } from './api-token-service';
import UserService from './user-service';
import ResetTokenService from './reset-token-service';
import SettingService from './setting-service';
import SessionService from './session-service';
import UserFeedbackService from './user-feedback-service';
import FeatureToggleService from './feature-toggle-service';
import EnvironmentService from './environment-service';
import FeatureTagService from './feature-tag-service';
import ProjectHealthService from './project-health-service';
import UserSplashService from './user-splash-service';
import { SegmentService } from './segment-service';

export const createServices = (
    stores: IUnleashStores,
    config: IUnleashConfig,
): IUnleashServices => {
    const accessService = new AccessService(stores, config);
    const apiTokenService = new ApiTokenService(stores, config);
    const clientInstanceService = new ClientInstanceService(stores, config);
    const clientMetricsServiceV2 = new ClientMetricsServiceV2(stores, config);
    const contextService = new ContextService(stores, config);
    const emailService = new EmailService(config.email, config.getLogger);
    const eventService = new EventService(stores, config);
    const featureTypeService = new FeatureTypeService(stores, config);
    const resetTokenService = new ResetTokenService(stores, config);
    const stateService = new StateService(stores, config);
    const strategyService = new StrategyService(stores, config);
    const tagService = new TagService(stores, config);
    const tagTypeService = new TagTypeService(stores, config);
    const addonService = new AddonService(stores, config, tagTypeService);
    const sessionService = new SessionService(stores, config);
    const settingService = new SettingService(stores, config);
    const userService = new UserService(stores, config, {
        accessService,
        resetTokenService,
        emailService,
        sessionService,
        settingService,
    });
    const versionService = new VersionService(stores, config);
    const healthService = new HealthService(stores, config);
    const userFeedbackService = new UserFeedbackService(stores, config);
    const featureToggleServiceV2 = new FeatureToggleService(stores, config);
    const environmentService = new EnvironmentService(stores, config);
    const featureTagService = new FeatureTagService(stores, config);
    const projectHealthService = new ProjectHealthService(
        stores,
        config,
        featureToggleServiceV2,
    );
    const projectService = new ProjectService(
        stores,
        config,
        accessService,
        featureToggleServiceV2,
    );
    const userSplashService = new UserSplashService(stores, config);
    const segmentService = new SegmentService(stores, config);

    return {
        accessService,
        addonService,
        featureToggleService: featureToggleServiceV2,
        featureToggleServiceV2,
        featureTypeService,
        healthService,
        projectService,
        stateService,
        strategyService,
        tagTypeService,
        tagService,
        clientInstanceService,
        clientMetricsServiceV2,
        contextService,
        versionService,
        apiTokenService,
        emailService,
        userService,
        resetTokenService,
        eventService,
        environmentService,
        settingService,
        sessionService,
        userFeedbackService,
        featureTagService,
        projectHealthService,
        userSplashService,
        segmentService,
    };
};

module.exports = {
    createServices,
};
