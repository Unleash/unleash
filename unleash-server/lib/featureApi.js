var db = require('./db'),
    eventStore = require('./eventStore'),
    eventType = require('./eventType'),
    featureDb = require('./featureDb');

module.exports = function (app) {

    app.get('/features', function (req, res) {
        featureDb.getFeatures().then(function (features) {
            res.json({features: features});
        });
    });

    app.get('/features/:id', function (req, res) {
        db.getFeature.then(function (feature) {
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

        db.getFeature(newFeature.name).then(function (feature) {
            if (feature) {
                //Todo: error-msg: feature name is already in use
                res.status(403).end();
            } else {
                eventStore.create({
                    type: eventType.featureCreated,
                    createdBy: createdBy,
                    data: newFeature
                }).then(function() {
                    res.status(201).end();
                });
            }
        });
    });

    app.patch('/features/:featureName', function (req, res) {
        var featureName = req.params.featureName;
        db.getFeature(featureName).then(function (feature) {
            if (feature) {
                var changeRequest = req.body;
                var event = {};
                event.type = 'feature-update';
                event.user = req.connection.remoteAddress;
                event.data = changeRequest;
                res.status(202).end();
            } else {
                res.status(404).end();
            }
        });
    });

};

