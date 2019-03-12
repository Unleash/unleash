'use strict';

const Controller = require('../controller');

class ConfigController extends Controller {
    constructor(config) {
        super(config);
        this.uiConfig = config.ui;

        this.get('/', this.getUIConfig);
    }

    async getUIConfig(req, res) {
        const config = this.uiConfig;
        res.json(config);
    }
}

module.exports = ConfigController;
