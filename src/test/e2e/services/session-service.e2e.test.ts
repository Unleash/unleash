import test, { after, before, beforeEach } from 'ava';
import noLoggerProvider from '../../fixtures/no-logger';
import dbInit from '../helpers/database-init';
import SessionService from '../../../lib/services/session-service';
import NotFoundError from '../../../lib/error/notfound-error';

let stores;
let db;
let sessionService;
const newSession = {
    sid: 'abc123',
    sess: {
        cookie: {
            originalMaxAge: 2880000,
            expires: new Date(Date.now() + 86_400_000).toDateString(),
            secure: false,
            httpOnly: true,
            path: '/',
        },
        user: {
            id: 1,
            username: 'admin',
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
            seenAt: '2021-04-26T10:59:18.782Z',
            loginAttempts: 0,
            createdAt: '2021-04-22T05:12:54.368Z',
        },
    },
};
const otherSession = {
    sid: 'xyz321',
    sess: {
        cookie: {
            originalMaxAge: 2880000,
            expires: new Date(Date.now() + 86400000).toDateString(),
            secure: false,
            httpOnly: true,
            path: '/',
        },
        user: {
            id: 2,
            username: 'editor',
            imageUrl:
                'https://gravatar.com/avatar/21232f297a57a5a743894a0e4a801fc3?size=42&default=retro',
            seenAt: '2021-04-26T10:59:18.782Z',
            loginAttempts: 0,
            createdAt: '2021-04-22T05:12:54.368Z',
        },
    },
};
before(async () => {
    db = await dbInit('session_service_serial', noLoggerProvider);
    stores = db.stores;
    sessionService = new SessionService(stores, {
        getLogger: noLoggerProvider,
    });
});

beforeEach(async () => {
    await db.stores.sessionStore.deleteAll();
});

after.always(async () => {
    await db.destroy();
});

test.serial('should list active sessions', async t => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getActiveSessions();
    t.is(sessions.length, 2);
    t.deepEqual(sessions[0].sess, otherSession.sess); // Ordered newest first
    t.deepEqual(sessions[1].sess, newSession.sess);
});

test.serial('Should list active sessions for user', async t => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getSessionsForUser(2); // editor session
    t.is(sessions.length, 1);
    t.deepEqual(sessions[0].sess, otherSession.sess);
});

test.serial('Can delete sessions by user', async t => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getActiveSessions();
    t.is(sessions.length, 2);
    await sessionService.deleteSessionsForUser(2);
    await t.throwsAsync(
        async () => {
            await sessionService.getSessionsForUser(2);
        },
        { instanceOf: NotFoundError },
    );
});

test.serial('Can delete session by sid', async t => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getActiveSessions();
    t.is(sessions.length, 2);

    await sessionService.deleteSession('abc123');
    await t.throwsAsync(async () => sessionService.getSession('abc123'), {
        instanceOf: NotFoundError,
    });
});
