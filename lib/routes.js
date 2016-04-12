var knex = require('./dbPool');
var logger = require('./logger');

module.exports = function (app) {
    app.get('/health', function (req, res) {
        knex.select(1)
            .from('features')
            .then(function() {
                res.json({health: 'GOOD'});
            })
            .catch(function(err) {
                logger.error('Could not select from features, error was: ', err);
                res.status(500).json({health: 'BAD'});
            });
    });
};
