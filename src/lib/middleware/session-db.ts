import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';

const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);

const TWO_DAYS = 48 * 60 * 60 * 1000;
function sessionDb(
    config: Pick<IUnleashConfig, 'session' | 'server' | 'secureHeaders'>,
    stores: Pick<IUnleashStores, 'db'>,
): any {
    let store;
    const { db } = config.session;
    const age = config.session.ttlHours * 60000 || TWO_DAYS;
    if (db) {
        store = new KnexSessionStore({
            knex: stores.db,
            tablename: 'unleash_session',
            createtable: false,
        });
    } else {
        store = new session.MemoryStore();
    }
    const sessionMiddleware = session({
        name: 'unleash-session',
        rolling: false,
        resave: false,
        saveUninitialized: false,
        store,
        secret: [config.server.secret],
        cookie: {
            path:
                config.server.baseUriPath === ''
                    ? '/'
                    : config.server.baseUriPath,
            secure: config.secureHeaders,
            maxAge: age,
        },
    });
    return (req, res, next) => sessionMiddleware(req, res, next);
}
export default sessionDb;
module.exports = sessionDb;
