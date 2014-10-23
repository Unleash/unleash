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
                res.json(404, {error: 'Could not find feature'});
            }
        });
    });

    app.post('/features', function (req, res) {
        var newFeature = req.body,
            createdBy = req.connection.remoteAddress;

        var handleFeatureExist = function() {
            res.status(403).end();
        };

        var handleCreateFeature = function () {
            eventStore.create({
                type: eventType.featureCreated,
                createdBy: createdBy,
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

