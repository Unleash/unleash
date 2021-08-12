import { Knex } from 'knex';
import session from 'express-session';
import knexSessionStore from 'connect-session-knex';
import { RequestHandler } from 'express';
import { IUnleashConfig } from '../types/option';

const TWO_DAYS = 48 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
function sessionDb(
    config: Pick<IUnleashConfig, 'session' | 'server' | 'secureHeaders'>,
    knex: Knex,
): RequestHandler {
    let store;
    const { db } = config.session;
    const age = config.session.ttlHours * HOUR || TWO_DAYS;
    const KnexSessionStore = knexSessionStore(session);
    if (db) {
        store = new KnexSessionStore({
            tablename: 'unleash_session',
            createtable: false,
            // @ts-ignore
            knex,
        });
    } else {
        store = new session.MemoryStore();
    }
    return session({
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
}
export default sessionDb;
