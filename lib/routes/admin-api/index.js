'use strict';

const Controller = require('../controller');
const FeatureController = require('./feature.js');
const ArchiveController = require('./archive.js');
const EventController = require('./event.js');
const StrategyController = require('./strategy');
const MetricsController = require('./metrics');
const UserController = require('./user');
const apiDef = require('./api-def.json');

class AdminApi extends Controller {
    constructor(config) {
        super();

        const stores = config.stores;
        const perms = config.extendedPermissions;

        this.app.get('/', this.index);
        this.app.use('/features', new FeatureController(perms, stores).router);
        this.app.use('/archive', new ArchiveController(perms, stores).router);
        this.app.use(
            '/strategies',
            new StrategyController(perms, stores).router
        );
        this.app.use('/events', new EventController(stores).router);
        this.app.use('/metrics', new MetricsController(perms, stores).router);
        this.app.use('/user', new UserController().router);
    }

    index(req, res) {
        res.json(apiDef);
    }
}

module.exports = AdminApi;
