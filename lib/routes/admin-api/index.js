'use strict';

const { Router } = require('express');

const features = require('./feature.js');
const ArchiveController = require('./archive.js');
const events = require('./event.js');
const strategies = require('./strategy');
const metrics = require('./metrics');
const user = require('./user');
const apiDef = require('./api-def.json');

class AdminApi {
    constructor(config) {
        const router = Router();
        this._router = router;

        router.get('/', (req, res) => res.json(apiDef));
        router.use('/features', features.router(config));
        router.use('/archive', new ArchiveController(config.stores).router());
        router.use('/strategies', strategies.router(config));
        router.use('/events', events.router(config));
        router.use('/metrics', metrics.router(config));
        router.use('/user', user.router(config));
    }

    index(req, res) {
        res.json(apiDef);
    }

    router() {
        return this._router;
    }
}

module.exports = AdminApi;
