'use strict';

const Controller = require('../controller');
const { clientRegisterSchema: schema } = require('./register-schema');

class RegisterController extends Controller {
    constructor({ clientInstanceStore, clientApplicationsStore }, getLogger) {
        super();
        this.logger = getLogger('/api/client/register');
        this.clientInstanceStore = clientInstanceStore;
        this.clientApplicationsStore = clientApplicationsStore;

        this.post('/', this.handleRegister);
    }

    async handleRegister(req, res) {
        const data = req.body;
        const { value, error } = schema.validate(data);

        if (error) {
            this.logger.warn('Invalid client data posted', error);
            return res.status(400).json(error);
        }

        value.clientIp = req.ip;

        try {
            await this.clientApplicationsStore.upsert(value);
            await this.clientInstanceStore.insert(value);
            const { appName, instanceId } = value;
            this.logger.info(
                `New client registration: appName=${appName}, instanceId=${instanceId}`
            );
            return res.status(202).end();
        } catch (err) {
            this.logger.error('failed to register client', err);
            return res.status(500).end();
        }
    }
}

module.exports = RegisterController;
