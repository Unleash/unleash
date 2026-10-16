import type { Knex } from 'knex';
import session from 'express-session';
import { ConnectSessionKnexStore } from 'connect-session-knex';
import type { RequestHandler } from 'express';
import type { IUnleashConfig } from '../types/option.js';
import { resolveSessionLimits } from '../sessions/session-limits.js';
import { sessionCookieOptions } from '../sessions/session-cookie.js';

function sessionDb(
    config: Pick<
        IUnleashConfig,
        'session' | 'server' | 'secureHeaders' | 'getLogger'
    >,
    knex: Knex,
): RequestHandler {
    const logger = config.getLogger('lib/middleware/session-db.ts');

    const { db, cookieName } = config.session;
    const { hardMaxAgeMs, idleTimeoutMs } = resolveSessionLimits(
        config.session,
    );

    if (idleTimeoutMs > 0 && idleTimeoutMs >= hardMaxAgeMs) {
        logger.warn(
            `SESSION_IDLE_TIMEOUT_MINUTES (${config.session.idleTimeoutMinutes}) is not shorter than SESSION_TTL_HOURS (${config.session.ttlHours}), so the idle timeout will never take effect. Sessions still end at the hard max age.`,
        );
    }

    const store: session.Store = db
        ? new ConnectSessionKnexStore({
              tableName: 'unleash_session',
              createTable: false,
              knex,
          })
        : new session.MemoryStore();

    return session({
        name: cookieName,
        rolling: false,
        resave: false,
        saveUninitialized: false,
        store,
        secret: [config.server.secret],
        cookie: {
            ...sessionCookieOptions(config),
            maxAge: hardMaxAgeMs,
        },
    });
}

export default sessionDb;
