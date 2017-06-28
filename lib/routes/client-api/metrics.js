'use strict';

const { Router } = require('express');
const joi = require('joi');
const logger = require('../../logger');

const { clientMetricsSchema } = require('./metrics-schema');

exports.router = config => {
    const { clientMetricsStore, clientInstanceStore } = config.stores;
    const router = Router();

    router.post('/', (req, res) => {
        const data = req.body;
        const clientIp = req.ip;

        joi.validate(data, clientMetricsSchema, (err, cleaned) => {
            if (err) {
                logger.warn('Invalid metrics posted', err);
                return res.status(400).json(err);
            }

            clientMetricsStore
                .insert(cleaned)
                .then(() =>
                    clientInstanceStore.insert({
                        appName: cleaned.appName,
                        instanceId: cleaned.instanceId,
                        clientIp,
                    })
                )
                .catch(err => logger.error('failed to store metrics', err));

            res.status(202).end();
        });
    });

    return router;
};
