var Promise             = require("bluebird");
var eventStore          = require('./eventStore');
var eventType           = require('./eventType');
var strategyDb          = require('./strategyDb');
var logger              = require('./logger');
var NameExistsError     = require('./error/NameExistsError');
var ValidationError     = require('./error/ValidationError');
var validateRequest     = require('./error/validateRequest');
var extractUser         = require('./extractUser');

module.exports = function (app) {

    app.get('/strategies', function (req, res) {
        strategyDb.getStrategies().then(function (strategies) {
            res.json({strategies: strategies});
        });
    });

    app.get('/strategies/:name', function (req, res) {
        strategyDb.getStrategy(req.params.name)
            .then(function (strategy) { res.json(strategy);  })
            .catch(function () { res.status(404).json({error: 'Could not find strategy'}); });
    });

    app.delete('/strategies/:name', function (req, res) {
        eventStore.create({
            type: eventType.strategyDeleted,
            createdBy: extractUser(req),
            data: {
                name: req.params.name
            }
        })
            .then(function ()  { res.status(200).end(); })
            .catch(function () { res.status(500).end(); });
    });

    app.post('/strategies', function (req, res) {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must match format ^[a-zA-Z\\.\\-]+$').matches(/^[a-zA-Z\\.\\-]+$/i);

        var newStrategy = req.body;

        validateRequest(req)
            .then(validateStrategyName)
            .then(function() {
                return eventStore.create({
                    type: eventType.strategyCreated,
                    createdBy: extractUser(req),
                    data: newStrategy
                });
            })
            .then(function () {
                res.status(201).end();
            })
            .catch(NameExistsError, function() {
                res.status(403).json([{msg: "A strategy named '" + req.body.name + "' already exists."}]).end();
            })
            .catch(ValidationError, function() {
                res.status(400).json(req.validationErrors());
            })
            .catch(function(err) {
                logger.error("Could not create strategy", err);
                res.status(500).end();
            });
    });

    function validateStrategyName(req) {
        return new Promise(function(resolve, reject) {
            strategyDb.getStrategy(req.body.name)
                .then(function() {
                    reject(new NameExistsError("Feature name already exist"));
                }, function() {
                    resolve(req);
                });
        });
    }

};
