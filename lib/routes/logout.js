'use strict';

const Controller = require('./controller');

class HealthCheckController extends Controller {
    constructor(config) {
        super(config);
        this.get('/', this.logout);
    }

    logout(req, res) {
        if (req.session) {
            req.session = null;
        }
        if (req.logout) {
            req.logout();
        }
        res.redirect(`${this.config.baseUriPath}/`);
    }
}

module.exports = HealthCheckController;
