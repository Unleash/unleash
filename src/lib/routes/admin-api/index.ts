import Controller from '../controller';
import { IUnleashServices, IUnleashConfig } from '../../types';
import FeatureController from './feature';
import { FeatureTypeController } from './feature-type';
import ArchiveController from './archive';
import StrategyController from './strategy';
import EventController from './event';
import PlaygroundController from './playground';
import MetricsController from './metrics';
import UserController from './user/user';
import ConfigController from './config';
import { ContextController } from './context';
import ClientMetricsController from './client-metrics';
import StateController from './state';
import TagController from './tag';
import TagTypeController from './tag-type';
import AddonController from './addon';
import { ApiTokenController } from './api-token';
import UserAdminController from './user-admin';
import EmailController from './email';
import UserFeedbackController from './user-feedback';
import UserSplashController from './user-splash';
import ProjectApi from './project';
import { EnvironmentsController } from './environments';
import ConstraintsController from './constraints';
import PatController from './user/pat';
import { PublicSignupController } from './public-signup';
import { conditionalMiddleware } from '../../middleware/conditional-middleware';

class AdminApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.app.use(
            '/features',
            new FeatureController(config, services).router,
        );

        this.app.use(
            '/feature-types',
            new FeatureTypeController(config, services).router,
        );
        this.app.use(
            '/archive',
            new ArchiveController(config, services).router,
        );
        this.app.use(
            '/strategies',
            new StrategyController(config, services).router,
        );
        this.app.use('/events', new EventController(config, services).router);
        this.app.use(
            '/playground',
            new PlaygroundController(config, services).router,
        );
        this.app.use(
            '/metrics',
            new MetricsController(config, services).router,
        );
        this.app.use(
            '/client-metrics',
            new ClientMetricsController(config, services).router,
        );
        this.app.use('/user', new UserController(config, services).router);
        this.app.use(
            '/user/tokens',
            new PatController(config, services).router,
        );
        this.app.use(
            '/ui-config',
            new ConfigController(config, services).router,
        );
        this.app.use(
            '/context',
            new ContextController(config, services).router,
        );
        this.app.use('/state', new StateController(config, services).router);
        this.app.use('/tags', new TagController(config, services).router);
        this.app.use(
            '/tag-types',
            new TagTypeController(config, services).router,
        );
        this.app.use('/addons', new AddonController(config, services).router);
        this.app.use(
            '/api-tokens',
            new ApiTokenController(config, services).router,
        );
        this.app.use('/email', new EmailController(config, services).router);
        this.app.use(
            '/user-admin',
            new UserAdminController(config, services).router,
        );
        this.app.use(
            '/feedback',
            new UserFeedbackController(config, services).router,
        );
        this.app.use('/projects', new ProjectApi(config, services).router);
        this.app.use(
            '/environments',
            new EnvironmentsController(config, services).router,
        );
        this.app.use(
            '/splash',
            new UserSplashController(config, services).router,
        );
        this.app.use(
            '/constraints',
            new ConstraintsController(config, services).router,
        );
        this.app.use(
            '/invite-link',
            conditionalMiddleware(
                () => config.flagResolver.isEnabled('publicSignup'),
                new PublicSignupController(config, services).router,
            ),
        );
    }
}

module.exports = AdminApi;
