'use strict';

const { Router } = require('express');
const logger = require('../logger')('health-check.js');

class HealthCheckController {
    constructor(config) {
        const app = Router();

        this.app = app;
        this.db = config.stores.db;

        app.get('/', (req, res) => this.index(req, res));
    }

    async index(req, res) {
        try {
            await this.db.select(1).from('features');
            res.json({ health: 'GOOD' });
        } catch (e) {
            logger.error('Could not select from features, error was: ', e);
            res.status(500).json({ health: 'BAD' });
        }
    }

    router() {
        return this.app;
    }
}

module.exports = HealthCheckController;
