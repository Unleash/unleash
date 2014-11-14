var eventStore = require('./eventStore'),
    eventType = require('./eventType'),
    featureDb = require('./featureDb');

module.exports = function (app) {

    app.get('/features', function (req, res) {
        featureDb.getFeatures().then(function (features) {
            res.json({features: features});
        });
    });

    app.get('/features/:featureName', function (req, res) {
        featureDb.getFeature(req.params.featureName)
            .then(function (feature) { res.json(feature); })
            .catch(function () {
                res.status(404).json({error: 'Could not find feature'});
            });
    });

    app.post('/features', function (req, res) {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must match format ^[a-zA-Z\\.\\-]+$').matches(/^[a-zA-Z\\.\\-]+$/i);

        var errors = req.validationErrors();

        if (errors) {
            res.status(400).json(errors);
            return;
        }

        var newFeature = req.body;

        var handleFeatureExist = function() {
            var errors = [
                {msg: "A feature named '" + newFeature.name + "' already exists."}
            ];

            res.status(403).json(errors).end();
        };

        var handleCreateFeature = function () {
            eventStore.create({
                type: eventType.featureCreated,
                createdBy: req.connection.remoteAddress,
                data: newFeature
            }).then(function () {
                res.status(201).end();
            }, function () {
                res.status(500).end();
            });
        };

        featureDb.getFeature(newFeature.name)
            .then(handleFeatureExist)
            .catch(handleCreateFeature);
    });

    app.put('/features/:featureName', function (req, res) {
        var featureName    = req.params.featureName;
        var createdBy      = req.connection.remoteAddress;
        var updatedFeature = req.body;

        updatedFeature.name = featureName;

        var event = {
            type: eventType.featureUpdated,
            createdBy: createdBy,
            data: updatedFeature
        };

        featureDb.getFeature(featureName)
            .then(function () {
                eventStore
                    .create(event)
                    .then(function () { res.status(200).end(); })
                    .catch(function () { res.status(500).end(); });
            })
            .catch(function () {
                res.status(404).end();
            });
    });

};

