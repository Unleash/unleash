var db = require('./db');


module.exports = function (app) {

    app.get('/features', function (req, res) {
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
                res.status(500).end();
            } else {
                db.addFeature(newFeature).then(function () {
                    res.status(201).end();
                });
            }
        });
    });

    app.patch('/features/:id', function (req, res) {
        var body = req.body;
        body.data.name = req.params.id;
        var event = {};
        event.type = 'feature-update';
        event.user = req.connection.remoteAddress;
        event.comment = body.comment;
        event.data = body.data;

        // console.log(event);

        // db.save(event).then(function () {
        res.status(204).end();
        // });

    });

};

