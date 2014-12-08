var eventStore = require('./eventStore');
var eventType = require('./eventType');
var strategyDb = require('./strategyDb');

module.exports = function (app) {

    app.get('/strategies', function (req, res) {
        strategyDb.getStrategies().then(function (strategies) {
            res.json({strategies: strategies});
        });
    });

    app.get('/strategies/:name', function (req, res) {
        strategyDb.getStrategy(req.params.name)
            .then(function (strategy) { res.json(strategy);  })
            .catch(function () { res.json(404, {error: 'Could not find strategy'}); });
    });

    app.delete('/strategies/:name', function (req, res) {
        eventStore.create({
            type: eventType.strategyDeleted,
            createdBy: req.connection.remoteAddress,
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

        var errors = req.validationErrors();

        if (errors) {
            res.status(400).json(errors);
            return;
        }

        var newStrategy = req.body;

        var handleStrategyExists = function() {
            var errors = [{msg: "A strategy named " + newStrategy.name + " already exists."}];
            res.status(403).json(errors);
        };

        var handleCreateStrategy = function() {
            eventStore.create({
                type: eventType.strategyCreated,
                createdBy: req.connection.remoteAddress,
                data: newStrategy
            })
                .then(function ()  { res.status(201).end(); })
                .catch(function () { res.status(500).end(); });
        };

        strategyDb.getStrategy(newStrategy.name)
            .then(handleStrategyExists)
            .catch(handleCreateStrategy);
    });

};

