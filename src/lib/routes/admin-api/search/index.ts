import EventSearchController from '../../../features/events/event-search-controller';
import FeatureSearchController from '../../../features/feature-search/feature-search-controller';
import type {
    Db,
    IUnleashConfig,
    IUnleashServices,
} from '../../../server-impl';
import Controller from '../../controller';

export class SearchApi extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices, db: Db) {
        super(config);

        this.app.use(
            '/features',
            new FeatureSearchController(config, services).router,
        );

        this.app.use(
            '/events',
            new EventSearchController(config, services).router,
        );

        this.app.use(
            '/events',
            new EventSearchController(config, services).router,
        );
    }
}
