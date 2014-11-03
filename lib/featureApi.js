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
        featureDb.getFeature(req.params.featureName).then(function (feature) {
            if (feature) {
                res.json(feature);
            } else {
                res.status(404).json({error: 'Could not find feature'});
            }
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
            res.status(403).end();
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

        featureDb.getFeature(newFeature.name).then(handleFeatureExist, handleCreateFeature);
    });

    app.patch('/features/:featureName', function (req, res) {
        var featureName = req.params.featureName,
            createdBy = req.connection.remoteAddress,
            changeRequest = req.body;

        changeRequest.name = featureName;

        featureDb.getFeature(featureName).then(
            function () {
                eventStore.create({
                    type: eventType.featureUpdated,
                    createdBy: createdBy,
                    data: changeRequest
                }).then(function () {
                    res.status(202).end();
                }, function () {
                    res.status(500).end();
                });
            },
            function () {
                res.status(404).end();
            }
        );
    });

};

