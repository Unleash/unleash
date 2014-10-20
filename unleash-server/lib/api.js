var featuresMock = require('./featuresMock');

function getFeature(name) {
    var featureFound;
    featuresMock.forEach(function (feature) {
        if (feature.name === name) {
            featureFound = feature;
        }
    });
    return featureFound;
}

module.exports = function (app) {

    app.get('/features', function (req, res) {
        res.json(featuresMock);
    });

    app.get('/features/:id', function (req, res) {
        var feature = getFeature(req.params.id);

        if (feature) {
            res.json(feature);
        } else {
            res.json(404, {error: 'Could not find feature'});
        }
    });

    app.post('/features', function (req, res) {
        var newFeature = req.body;

        if (!getFeature(newFeature.name)) {
            featuresMock.push(newFeature);
            res.status(201).end();
        } else {
            res.status(500).end();
        }
    });

};

