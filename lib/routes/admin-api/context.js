'use strict';

const Controller = require('../controller');

const builtInContextFields = [
    { name: 'environment' },
    { name: 'userId' },
    { name: 'appName' },
];

class ContextController extends Controller {
    constructor(config) {
        super(config);
        this.contextFields = builtInContextFields.concat(
            config.customContextFields
        );
        this.get('/', this.getContextFields);
    }

    getContextFields(req, res) {
        res.status(200)
            .json(this.contextFields)
            .end();
    }
}

module.exports = ContextController;
