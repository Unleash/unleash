import clientApiDef from './client-api/api-def.json';
import adminApiDef from './admin-api/api-def.json';
import version from '../util/version';

export const api = {
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
