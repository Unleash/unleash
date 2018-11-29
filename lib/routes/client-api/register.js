'use strict';

const { Router } = require('express');
const joi = require('joi');
const logger = require('../../logger')('/client-api/register.js');

const { clientRegisterSchema: schema } = require('./register-schema');

class RegisterController {
    constructor({ clientInstanceStore, clientApplicationsStore }) {
        const router = Router();
        this._router = router;
        this.clientInstanceStore = clientInstanceStore;
        this.clientApplicationsStore = clientApplicationsStore;

        router.post('/', (req, res) => this.handleRegister(req, res));
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

    router() {
        return this._router;
    }
}

module.exports = RegisterController;
