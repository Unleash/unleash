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
        super(config);

        this.app.get('/', this.index);
        this.app.use('/features', new FeatureController(config).router);
        this.app.use('/archive', new ArchiveController(config).router);
        this.app.use('/strategies', new StrategyController(config).router);
        this.app.use('/events', new EventController(config).router);
        this.app.use('/metrics', new MetricsController(config).router);
        this.app.use('/user', new UserController(config).router);
    }

    index(req, res) {
        res.json(apiDef);
    }
}

module.exports = AdminApi;
