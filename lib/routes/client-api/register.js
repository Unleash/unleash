'use strict';

const { Router } = require('express');
const joi = require('joi');
const logger = require('../../logger');

const { clientRegisterSchema } = require('./register-schema');

exports.router = config => {
    const { clientInstanceStore, clientApplicationsStore } = config.stores;
    const router = Router();

    router.post('/', (req, res) => {
        const data = req.body;

        joi.validate(data, clientRegisterSchema, (err, clientRegistration) => {
            if (err) {
                logger.warn('Invalid client data posted', err);
                return res.status(400).json(err);
            }

            clientRegistration.clientIp = req.ip;

            clientApplicationsStore
                .upsert(clientRegistration)
                .then(() => clientInstanceStore.insert(clientRegistration))
                .then(() =>
                    logger.info(`New client registered with
                        appName=${clientRegistration.appName} and instanceId=${clientRegistration.instanceId}`)
                )
                .catch(err => logger.error('failed to register client', err));

            res.status(202).end();
        });
    });

    return router;
};
