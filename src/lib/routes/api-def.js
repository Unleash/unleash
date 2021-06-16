'use strict';

const clientApiDef = require('./client-api/api-def.json');
const adminApiDef = require('./admin-api/api-def.json');
const v2ApiDef = require('./v2/api-def.json');
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
        v2: {
            uri: '/api/v2',
            links: v2ApiDef.links,
        },
    },
};

module.exports = apiDef;
