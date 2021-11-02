import noLoggerProvider from '../../fixtures/no-logger';
import dbInit from '../helpers/database-init';
import SessionService from '../../../lib/services/session-service';
import NotFoundError from '../../../lib/error/notfound-error';
import { addDays, minutesToMilliseconds } from 'date-fns';

let stores;
let db;
let sessionService;
const newSession = {
    sid: 'abc123',
    sess: {
        cookie: {
            originalMaxAge: minutesToMilliseconds(48),
            expires: addDays(Date.now(), 1).toDateString(),
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
            originalMaxAge: minutesToMilliseconds(48),
            expires: addDays(Date.now(), 1).toDateString(),
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

beforeAll(async () => {
    db = await dbInit('session_service_serial', noLoggerProvider);
    stores = db.stores;
    sessionService = new SessionService(stores, {
        getLogger: noLoggerProvider,
    });
});

beforeEach(async () => {
    await db.stores.sessionStore.deleteAll();
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

test('should list active sessions', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getActiveSessions();
    expect(sessions.length).toBe(2);
    expect(sessions[0].sess).toEqual(otherSession.sess); // Ordered newest first
    expect(sessions[1].sess).toEqual(newSession.sess);
});

test('Should list active sessions for user', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getSessionsForUser(2); // editor session
    expect(sessions.length).toBe(1);
    expect(sessions[0].sess).toEqual(otherSession.sess);
});

test('Can delete sessions by user', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getActiveSessions();
    expect(sessions.length).toBe(2);
    await sessionService.deleteSessionsForUser(2);
    await expect(async () => {
        await sessionService.getSessionsForUser(2);
    }).rejects.toThrow(NotFoundError);
});

test('Can delete session by sid', async () => {
    await sessionService.insertSession(newSession);
    await sessionService.insertSession(otherSession);

    const sessions = await sessionService.getActiveSessions();
    expect(sessions.length).toBe(2);

    await sessionService.deleteSession('abc123');
    await expect(async () =>
        sessionService.getSession('abc123'),
    ).rejects.toThrow(NotFoundError);
});
