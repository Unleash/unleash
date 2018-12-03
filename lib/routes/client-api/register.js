'use strict';

const joi = require('joi');
const logger = require('../../logger')('/client-api/register.js');

const Controller = require('../controller');
const { clientRegisterSchema: schema } = require('./register-schema');

class RegisterController extends Controller {
    constructor({ clientInstanceStore, clientApplicationsStore }) {
        super();
        this.clientInstanceStore = clientInstanceStore;
        this.clientApplicationsStore = clientApplicationsStore;

        this.post('/', this.handleRegister);
    }

    async handleRegister(req, res) {
        const data = req.body;
        const { value: clientRegistration, error } = joi.validate(data, schema);

        if (error) {
            logger.warn('Invalid client data posted', error);
            return res.status(400).json(error);
        }

        clientRegistration.clientIp = req.ip;

        try {
            await this.clientApplicationsStore.upsert(clientRegistration);
            await this.clientInstanceStore.insert(clientRegistration);
            logger.info(
                `New client registered with appName=${
                    clientRegistration.appName
                } and instanceId=${clientRegistration.instanceId}`
            );
            return res.status(202).end();
        } catch (err) {
            logger.error('failed to register client', err);
            return res.status(500).end();
        }
    }
}

module.exports = RegisterController;
