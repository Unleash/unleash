'use strict';

const Controller = require('../controller');
const FeatureController = require('./feature.js');
const ArchiveController = require('./archive.js');
const EventController = require('./event.js');
const StrategyController = require('./strategy');
const MetricsController = require('./metrics');
const UserController = require('./user');
const ConfigController = require('./config');
const ContextController = require('./context');
const StateController = require('./state');
const apiDef = require('./api-def.json');

class AdminApi extends Controller {
    constructor(config) {
        super(config);

        this.app.get('/', this.index);
        this.app.use('/features', new FeatureController(config).router);
        this.app.use('/archive', new ArchiveController(config).router);
        this.app.use('/strategies', new StrategyController(config).router);
        this.app.use('/events', new EventController(config).router);
        this.app.use('/metrics', new MetricsController(config).router);
        this.app.use('/user', new UserController(config).router);
        this.app.use('/ui-config', new ConfigController(config).router);
        this.app.use('/context', new ContextController(config).router);
        this.app.use('/state', new StateController(config).router);
    }

    index(req, res) {
        res.json(apiDef);
    }
}

module.exports = AdminApi;
