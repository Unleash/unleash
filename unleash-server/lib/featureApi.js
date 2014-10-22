var db = require('./db');
var eventStore = require('./eventStore');

module.exports = function (app) {

    app.get('/features', function (req, res) {
        // TODO svelovla, fix this
        eventStore.create({name: 'testing method'});
        db.getFeatures().then(function (features) {
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
        var newFeature = req.body;

        db.getFeature(newFeature.name).then(function (feature) {
            if (feature) {
                res.status(403).end();
            } else {
                db.addFeature(newFeature).then(function () {
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

