'use strict';

const Controller = require('../controller');

class RegisterController extends Controller {
    constructor({ clientMetricsService }, getLogger) {
        super();
        this.logger = getLogger('/api/client/register');
        this.metrics = clientMetricsService;
        this.post('/', this.handleRegister);
    }

    async handleRegister(req, res) {
        const data = req.body;
        try {
            const clientIp = req.ip;
            await this.metrics.registerClient(data, clientIp);
            return res.status(202).end();
        } catch (err) {
            this.logger.error('failed to register client', err);
            switch (err.name) {
                case 'ValidationError':
                    return res.status(400).end();
                default:
                    return res.status(500).end();
            }
        }
    }
}

module.exports = RegisterController;
