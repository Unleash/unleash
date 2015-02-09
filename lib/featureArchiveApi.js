var logger              = require('./logger');
var eventStore          = require('./eventStore');
var eventType           = require('./eventType');
var featureDb           = require('./featureDb');
var ValidationError     = require('./error/ValidationError');
var validateRequest     = require('./error/validateRequest');

module.exports = function (app) {

    app.get('/archive/features', function (req, res) {
        featureDb.getArchivedFeatures().then(function (archivedFeatures) {
            res.json({'features': archivedFeatures});
        });
    });

    app.post('/archive/revive', function (req, res) {
        req.checkBody('name', 'Name is required').notEmpty();

        validateRequest(req)
            .then(function() {
                return eventStore.create({
                    type: eventType.featureRevived,
                    createdBy: req.connection.remoteAddress,
                    data: req.body
                });
            }).then(function() {
                res.status(200).end();
            }).catch(ValidationError, function() {
                res.status(400).json(req.validationErrors());
            })
            .catch(function(err) {
                logger.error("Could not revive feature toggle", err);
                res.status(500).end();
            });
    });
};

