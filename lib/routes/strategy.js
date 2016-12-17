'use strict';

const joi = require('joi');
const eventType = require('../event-type');
const logger = require('../logger');
const NameExistsError = require('../error/name-exists-error');
const extractUser = require('../extract-user');
const strategySchema = require('./strategy-schema');
const version = 1;

const handleError = (req, res, error) => {
    switch (error.name) {
        case 'NotFoundError':
            return res
                .status(404)
                .end();
        case 'NameExistsError':
            return res
                .status(403)
                .json([{ msg: `A strategy named '${req.body.name}' already exists.` }])
                .end();
        case 'ValidationError':
            return res
                .status(400)
                .json(error)
                .end();
        default:
            logger.error('Could perfom operation', error);
            return res
                .status(500)
                .end();
    }
};

module.exports = function (app, config) {
    const { strategyStore, eventStore } = config.stores;

    app.get('/strategies', (req, res) => {
        strategyStore.getStrategies().then(strategies => {
            res.json({ version, strategies });
        });
    });

    app.get('/strategies/:name', (req, res) => {
        strategyStore.getStrategy(req.params.name)
            .then(strategy => res.json(strategy).end())
            .catch(() => res.status(404).json({ error: 'Could not find strategy' }));
    });

    app.delete('/strategies/:name', (req, res) => {
        const strategyName = req.params.name;

        strategyStore.getStrategy(strategyName)
            .then(() => eventStore.store({
                type: eventType.STRATEGY_DELETED,
                createdBy: extractUser(req),
                data: {
                    name: strategyName,
                },
            }))
            .then(() => res.status(200).end())
            .catch(error => handleError(req, res, error));
    });

    app.post('/strategies', (req, res) => {
        const data = req.body;
        validateInput(data)
            .then(validateStrategyName)
            .then((newStrategy) => eventStore.store({
                type: eventType.STRATEGY_CREATED,
                createdBy: extractUser(req),
                data: newStrategy,
            }))
            .then(() => res.status(201).end())
            .catch(error => handleError(req, res, error));
    });

    app.put('/strategies/:strategyName', (req, res) => {
        const strategyName = req.params.strategyName;
        const updatedStrategy = req.body;

        updatedStrategy.name = strategyName;

        strategyStore.getStrategy(strategyName)
            .then(() => validateInput(updatedStrategy))
            .then(() => eventStore.store({
                type: eventType.STRATEGY_UPDATED,
                createdBy: extractUser(req),
                data: updatedStrategy,
            }))
            .then(() => res.status(200).end())
            .catch(error => handleError(req, res, error));
    });

    function validateStrategyName (data) {
        return new Promise((resolve, reject) => {
            strategyStore.getStrategy(data.name)
                .then(() => reject(new NameExistsError('Feature name already exist')))
                .catch(() => resolve(data));
        });
    }

    function validateInput (data) {
        return new Promise((resolve, reject) => {
            joi.validate(data, strategySchema, (err, cleaned) => {
                if (err) {
                    return reject(err);
                }
                return resolve(cleaned);
            });
        });
    }
};
