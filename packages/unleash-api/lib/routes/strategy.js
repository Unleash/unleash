'use strict';
const Promise             = require("bluebird");
const eventType           = require('../eventType');
const logger              = require('../logger');
const NameExistsError     = require('../error/NameExistsError');
const ValidationError     = require('../error/ValidationError');
const NotFoundError       = require('../error/NotFoundError');
const validateRequest     = require('../error/validateRequest');
const extractUser         = require('../extractUser');

module.exports = function (app, config) {
    const strategyDb = config.strategyDb;
    const eventStore = config.eventStore;

    app.get('/strategies', (req, res) => {
        strategyDb.getStrategies().then(strategies => {
            res.json({ strategies });
        });
    });

    app.get('/strategies/:name', (req, res) => {
        strategyDb.getStrategy(req.params.name)
            .then(strategy => {
                res.json(strategy);
            })
            .catch(() => {
                res.status(404).json({ error: 'Could not find strategy' });
            });
    });

    app.delete('/strategies/:name', (req, res) => {
        const strategyName = req.params.name;

        strategyDb.getStrategy(strategyName)
            .then(() => eventStore.create({
            type: eventType.strategyDeleted,
            createdBy: extractUser(req),
            data: {
                name: strategyName
            }
        }))
            .then(() => {
                res.status(200).end();
            })
            .catch(NotFoundError, () => {
                res.status(404).end();
            })
            .catch(err => {
                logger.error(`Could not delete strategy=${strategyName}`, err);
                res.status(500).end();
            });
    });

    app.post('/strategies', (req, res) => {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must match format ^[a-zA-Z\\.\\-]+$').matches(/^[a-zA-Z\\.\\-]+$/i);

        const newStrategy = req.body;

        validateRequest(req)
            .then(validateStrategyName)
            .then(() => eventStore.create({
            type: eventType.strategyCreated,
            createdBy: extractUser(req),
            data: newStrategy
        }))
            .then(() => {
                res.status(201).end();
            })
            .catch(NameExistsError, () => {
                res.status(403).json([{ msg: `A strategy named '${req.body.name}' already exists.` }]).end();
            })
            .catch(ValidationError, () => {
                res.status(400).json(req.validationErrors());
            })
            .catch(err => {
                logger.error("Could not create strategy", err);
                res.status(500).end();
            });
    });

    function validateStrategyName(req) {
        return new Promise((resolve, reject) => {
            strategyDb.getStrategy(req.body.name)
                .then(() => {
                    reject(new NameExistsError("Feature name already exist"));
                }, () => {
                    resolve(req);
                });
        });
    }
};
