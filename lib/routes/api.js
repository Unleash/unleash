'use strict';

const apiDef = {
    version: 1,
    links: {
        'feature-toggles': { uri: '/api/features' },
        'strategies': { uri: '/api/strategies' },
        'events': { uri: '/api/events' },
        'client-register': { uri: '/api/client/register' },
        'client-metrics': { uri: '/api/client/register' },
        'seen-toggles': { uri: '/api/client/seen-toggles' },
    },
};

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.json(apiDef);
    });
};
