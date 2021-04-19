'use strict';

const Controller = require('../controller');
const FeatureController = require('./feature.js');
const FeatureTypeController = require('./feature-type.js');
const ArchiveController = require('./archive.js');
const EventController = require('./event.js');
const StrategyController = require('./strategy');
const MetricsController = require('./metrics');
const UserController = require('./user');
const ConfigController = require('./config');
const ContextController = require('./context');
const StateController = require('./state');
const TagController = require('./tag');
const TagTypeController = require('./tag-type');
const AddonController = require('./addon');
const ApiTokenController = require('./api-token-controller');
const EmailController = require('./email');
const UserAdminController = require('./user-admin');
const apiDef = require('./api-def.json');
const BootstrapController = require('./bootstrap-controller');

class AdminApi extends Controller {
    constructor(config, services) {
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
    }

    index(req, res) {
        res.json(apiDef);
    }
}

module.exports = AdminApi;
