var Promise             = require("bluebird");
var logger              = require('../logger');
var eventStore          = require('../eventStore');
var eventType           = require('../eventType');
var featureDb           = require('../db/feature');
var NameExistsError     = require('../error/NameExistsError');
var NotFoundError       = require('../error/NotFoundError');
var ValidationError     = require('../error/ValidationError');
var validateRequest     = require('../error/validateRequest');
var extractUser         = require('../extractUser');

module.exports = function (app) {
    app.get('/features', function (req, res) {
        featureDb.getFeatures().then(function (features) {
            res.json({ features: features });
        });
    });

    app.get('/features/:featureName', function (req, res) {
        featureDb.getFeature(req.params.featureName)
            .then(function (feature) {
                res.json(feature);
            })
            .catch(function () {
                res.status(404).json({ error: 'Could not find feature' });
            });
    });

    app.post('/features', function (req, res) {
        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('name', 'Name must match format ^[a-zA-Z\\.\\-]+$').matches(/^[a-zA-Z\\.\\-]+$/i);

        validateRequest(req)
            .then(validateUniqueName)
            .then(function() {
                return eventStore.create({
                    type: eventType.featureCreated,
                    createdBy: extractUser(req),
                    data: req.body
                });
            })
            .then(function () {
                res.status(201).end();
            })
            .catch(NameExistsError, function() {
                res.status(403).json([{
                    msg: "A feature named '" + req.body.name + "' already exists. It could be archived."
                }]).end();
            })
            .catch(ValidationError, function() {
                res.status(400).json(req.validationErrors());
            })
            .catch(function(err) {
                logger.error("Could not create feature toggle", err);
                res.status(500).end();
            });
    });

    app.put('/features/:featureName', function (req, res) {
        var featureName    = req.params.featureName;
        var userName       = extractUser(req);
        var updatedFeature = req.body;

        updatedFeature.name = featureName;

        featureDb.getFeature(featureName)
            .then(function () {
                return eventStore.create({
                    type: eventType.featureUpdated,
                    createdBy: userName,
                    data: updatedFeature
                });
            })
            .then(function () {
                res.status(200).end();
            })
            .catch(NotFoundError, function () {
                res.status(404).end();
            })
            .catch(function (err) {
                logger.error("Could not update feature toggle="+featureName, err);
                res.status(500).end();
            });
    });

    app.delete('/features/:featureName', function (req, res) {
        var featureName    = req.params.featureName;
        var userName       = extractUser(req);

        featureDb.getFeature(featureName)
            .then(function () {
                return eventStore.create({
                    type: eventType.featureArchived,
                    createdBy: userName,
                    data: {
                        name: featureName
                    }
                });
            })
            .then(function () {
                res.status(200).end();
            })
            .catch(NotFoundError, function () {
                res.status(404).end();
            })
            .catch(function (err) {
                logger.error("Could not archive feature="+featureName, err);
                res.status(500).end();
            });
    });

    function validateUniqueName(req) {
        return new Promise(function(resolve, reject) {
            featureDb.getFeature(req.body.name)
                .then(function() {
                    reject(new NameExistsError("Feature name already exist"));
                }, function() {
                    resolve(req);
                });
        });
    }
};
