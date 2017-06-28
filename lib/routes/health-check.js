'use strict';

const logger = require('../logger');
const { Router } = require('express');

exports.router = function(config) {
    const router = Router();

    router.get('/', (req, res) => {
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

    return router;
};
