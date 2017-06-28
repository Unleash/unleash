'use strict';

const logger = require('../logger');

module.exports = function(app, config) {
    app.get('/health', (req, res) => {
        config.stores.db
            .select(1)
            .from('features')
            .then(() => res.json({ health: 'GOOD' }))
            .catch(err => {
                logger.error(
                    'Could not select from features, error was: ',
                    err
                );
                res.status(500).json({ health: 'BAD' });
            });
    });
};
