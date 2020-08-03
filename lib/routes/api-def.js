'use strict';

const clientApiDef = require('./client-api/api-def.json');
const adminApiDef = require('./admin-api/api-def.json');
const version = require('../util/version');

const apiDef = {
    name: 'unleash-server',
    version,
    uri: '/api',
    links: {
        admin: {
            uri: '/api/admin',
            links: adminApiDef.links,
        },
        client: {
            uri: '/api/client',
            links: clientApiDef.links,
        },
    },
};

module.exports = apiDef;
