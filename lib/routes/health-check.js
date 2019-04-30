'use strict';

const Controller = require('./controller');

class HealthCheckController extends Controller {
    constructor(config) {
        super();
        this.db = config.stores.db;
        this.logger = config.getLogger('health-check.js');

        this.get('/', (req, res) => this.index(req, res));
    }

    async index(req, res) {
        try {
            await this.db.select(1).from('features');
            res.json({ health: 'GOOD' });
        } catch (e) {
            this.logger.error('Could not select from features, error was: ', e);
            res.status(500).json({ health: 'BAD' });
        }
    }
}

module.exports = HealthCheckController;
