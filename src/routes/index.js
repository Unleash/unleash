'use strict';

const AdminApi = require('./admin-api');
const ClientApi = require('./client-api');
const FeatureController = require('./client-api/feature.js');

const Controller = require('./controller');
const HealthCheckController = require('./health-check');
const BackstageCTR = require('./backstage.js');
const LogoutController = require('./logout');
const api = require('./api-def');

class IndexRouter extends Controller {
    constructor(config, services) {
        super();
        this.use('/health', new HealthCheckController(config).router);
        this.use('/internal-backstage', new BackstageCTR(config).router);
        this.use('/logout', new LogoutController(config).router);
        this.get(api.uri, this.index);
        this.use(api.links.admin.uri, new AdminApi(config, services).router);
        this.use(api.links.client.uri, new ClientApi(config, services).router);

        // legacy support (remove in 4.x)
        if (config.enableLegacyRoutes) {
            const featureController = new FeatureController(
                services,
                config.getLogger,
            );
            this.use('/api/features', featureController.router);
        }
    }

    index(req, res) {
        res.json(api);
    }
}

module.exports = IndexRouter;
