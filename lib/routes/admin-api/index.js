'use strict';

const Controller = require('../controller');
const FeatureController = require('./feature.js');
const ArchiveController = require('./archive.js');
const EventController = require('./event.js');
const strategies = require('./strategy');
const metrics = require('./metrics');
const user = require('./user');
const apiDef = require('./api-def.json');

class AdminApi extends Controller {
    constructor(config) {
        super();

        const stores = config.stores;

        this.app.get('/', this.index);
        this.app.use('/features', new FeatureController(stores).router);
        this.app.use('/archive', new ArchiveController(stores).router);
        this.app.use('/strategies', strategies.router(config));
        this.app.use('/events', new EventController(stores).router);
        this.app.use('/metrics', metrics.router(config));
        this.app.use('/user', user.router(config));
    }

    index(req, res) {
        res.json(apiDef);
    }
}

module.exports = AdminApi;
