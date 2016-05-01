var logger = require('../logger');

module.exports = function (app, config) {
    app.get('/health', function (req, res) {
        config.db.select(1)
            .from('features')
            .then(function() {
                res.json({ health: 'GOOD' });
            })
            .catch(function(err) {
                logger.error('Could not select from features, error was: ', err);
                res.status(500).json({ health: 'BAD' });
            });
    });
};
