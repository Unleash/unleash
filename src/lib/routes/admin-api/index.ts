import apiDef from './api-def.json';
import Controller from '../controller';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import FeatureController from './feature';
import FeatureTypeController from './feature-type';
import ArchiveController from './archive';
import StrategyController from './strategy';
import EventController from './event';
import MetricsController from './metrics';
import UserController from './user';
import ConfigController from './config';
import ContextController from './context';
import ClientMetricsController from './client-metrics';
import BootstrapController from './bootstrap-controller';
import StateController from './state';
import TagController from './tag';
import TagTypeController from './tag-type';
import AddonController from './addon';
import ApiTokenController from './api-token-controller';
import UserAdminController from './user-admin';
import EmailController from './email';
import UserFeedbackController from './user-feedback-controller';
import UserSplashController from './user-splash-controller';
import ProjectApi from './project';
import { EnvironmentsController } from './environments-controller';

class AdminApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.app.get('/', this.index);

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
            '/metrics',
            new MetricsController(config, services).router,
        );
        this.app.use(
            '/client-metrics',
            new ClientMetricsController(config, services).router,
        );
        this.app.use('/user', new UserController(config, services).router);
        this.app.use(
            '/ui-config',
            new ConfigController(config, services).router,
        );
        this.app.use(
            '/ui-bootstrap',
            new BootstrapController(config, services).router,
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
    }

    index(req, res) {
        res.json(apiDef);
    }
}

module.exports = AdminApi;
