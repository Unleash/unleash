import Controller from '../controller';
import type { IUnleashServices, IUnleashConfig } from '../../types';
import FeatureController from '../../features/feature-toggle/legacy/feature-toggle-legacy-controller';
import { FeatureTypeController } from './feature-type';
import ArchiveController from '../../features/feature-toggle/archive-feature-toggle-controller';
import StrategyController from './strategy';
import EventController from './event';
import PlaygroundController from '../../features/playground/playground';
import MetricsController from './metrics';
import UserController from './user/user';
import ConfigController from './config';
import { ContextController } from './context';
import ClientMetricsController from '../../features/metrics/client-metrics/client-metrics';
import TagController from './tag';
import TagTypeController from '../../features/tag-type/tag-type';
import AddonController from './addon';
import { ApiTokenController } from './api-token';
import UserAdminController from './user-admin';
import EmailController from './email';
import UserFeedbackController from './user-feedback';
import UserSplashController from './user-splash';
import ProjectController from '../../features/project/project-controller';
import { EnvironmentsController } from './environments';
import ConstraintsController from './constraints';
import PatController from './user/pat';
import { PublicSignupController } from './public-signup';
import InstanceAdminController from './instance-admin';
import TelemetryController from './telemetry';
import FavoritesController from './favorites';
import MaintenanceController from '../../features/maintenance/maintenance-controller';
import { createKnexTransactionStarter } from '../../db/transaction';
import type { Db } from '../../db/db';
import ExportImportController from '../../features/export-import-toggles/export-import-controller';
import { SegmentsController } from '../../features/segment/segment-controller';
import { InactiveUsersController } from '../../users/inactive/inactive-users-controller';
import { UiObservabilityController } from '../../features/ui-observability-controller/ui-observability-controller';
import { SearchApi } from './search';

export class AdminApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db) {
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
            new ArchiveController(
                config,
                services,
                createKnexTransactionStarter(db),
            ).router,
        );
        this.app.use(
            '/strategies',
            new StrategyController(config, services).router,
        );
        this.app.use('', new EventController(config, services).router);
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
        this.app.use(
            '/features-batch',
            new ExportImportController(config, services).router,
        );
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
            '/user-admin/inactive',
            new InactiveUsersController(config, services).router,
        ); // Needs to load first, so that /api/admin/user-admin/{id} doesn't hit first
        this.app.use(
            '/user-admin',
            new UserAdminController(config, services).router,
        );

        this.app.use(
            '/feedback',
            new UserFeedbackController(config, services).router,
        );
        this.app.use(
            '/projects',
            new ProjectController(config, services, db).router,
        );
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
            new PublicSignupController(config, services).router,
        );
        this.app.use(
            '/instance-admin',
            new InstanceAdminController(config, services).router,
        );
        this.app.use(
            `/projects`,
            new FavoritesController(config, services).router,
        );
        this.app.use(
            `/segments`,
            new SegmentsController(config, services).router,
        );
        this.app.use(
            '/maintenance',
            new MaintenanceController(config, services).router,
        );

        this.app.use(
            '/telemetry',
            new TelemetryController(config, services).router,
        );

        this.app.use('/search', new SearchApi(config, services, db).router);

        this.app.use(
            '/record-ui-error',
            new UiObservabilityController(config, services).router,
        );
    }
}
