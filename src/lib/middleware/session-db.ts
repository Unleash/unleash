import type { Knex } from 'knex';
import session from 'express-session';
import { ConnectSessionKnexStore } from 'connect-session-knex';
import type { RequestHandler } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import { hoursToMilliseconds } from 'date-fns';

function sessionDb(
    config: Pick<IUnleashConfig, 'session' | 'server' | 'secureHeaders'>,
    knex: Knex,
): RequestHandler {
    let store: session.Store;
    const { db, cookieName } = config.session;
    const age =
        hoursToMilliseconds(config.session.ttlHours) || hoursToMilliseconds(48);
    if (db) {
        store = new ConnectSessionKnexStore({
            tableName: 'unleash_session',
            createTable: false,
            knex,
        });
    } else {
        store = new session.MemoryStore();
    }
    return session({
        name: cookieName,
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
            sameSite: 'lax',
        },
    });
}

export default sessionDb;
