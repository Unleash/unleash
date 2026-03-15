import supertest from 'supertest';
import { describe, test, expect } from 'vitest';
import { createServices } from '../../services/index.js';
import { createTestConfig } from '../../../test/config/test-config.js';
import createStores from '../../../test/fixtures/store.js';
import getApp from '../../app.js';
import permissions from '../../../test/fixtures/permissions.js';

async function getSetup() {
    const stores = createStores();
    const perms = permissions();

    const config = createTestConfig({
        preRouterHook: perms.hook,
    });

    const services = createServices(stores, config);
    const app = await getApp(config, stores, services);

    return {
        sessionStore: stores.sessionStore,
        request: supertest(app),
    };
}

describe('GET /api/admin/sessions', () => {
    test('returns 200 with an empty sessions list when no sessions exist', async () => {
        const { request } = await getSetup();

        const res = await request
            .get('/api/admin/sessions')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(res.body.sessions).toEqual([]);
    });

    test('returns active sessions with required fields', async () => {
        const { request, sessionStore } = await getSetup();

        await sessionStore.insertSession({
            sid: 'test-sid',
            sess: {
                user: { id: 42, name: 'Test User', email: 'user@example.com' },
                userAgent: 'Mozilla/5.0',
                ip: '127.0.0.1',
            },
            expired: new Date(Date.now() + 60_000),
        });

        const res = await request.get('/api/admin/sessions').expect(200);

        expect(res.body.sessions).toHaveLength(1);
        const session = res.body.sessions[0];
        expect(session).toHaveProperty('id');
        expect(session.userId).toBe(42);
        expect(session.userName).toBe('Test User');
        expect(session.userEmail).toBe('user@example.com');
        expect(session.userAgent).toBe('Mozilla/5.0');
        expect(session.ipAddress).toBe('127.0.0.1');
        expect(session).toHaveProperty('createdAt');
    });

    test('does not expose the raw session token (sid)', async () => {
        const { request, sessionStore } = await getSetup();

        await sessionStore.insertSession({
            sid: 'secret-session-token',
            sess: { user: { id: 1 } },
            expired: new Date(Date.now() + 60_000),
        });

        const res = await request.get('/api/admin/sessions').expect(200);

        const session = res.body.sessions[0];
        expect(session).not.toHaveProperty('sid');
        expect(JSON.stringify(res.body)).not.toContain('secret-session-token');
    });

    test('does not return sessions without an expiry', async () => {
        const { request, sessionStore } = await getSetup();

        await sessionStore.insertSession({
            sid: 'no-expiry',
            sess: { user: { id: 1 } },
        });

        const res = await request.get('/api/admin/sessions').expect(200);

        expect(res.body.sessions).toHaveLength(0);
    });

    test('returns multiple sessions', async () => {
        const { request, sessionStore } = await getSetup();

        await sessionStore.insertSession({
            sid: 'sid-1',
            sess: { user: { id: 1, email: 'alice@example.com' } },
            expired: new Date(Date.now() + 60_000),
        });
        await sessionStore.insertSession({
            sid: 'sid-2',
            sess: { user: { id: 2, email: 'bob@example.com' } },
            expired: new Date(Date.now() + 60_000),
        });

        const res = await request.get('/api/admin/sessions').expect(200);

        expect(res.body.sessions).toHaveLength(2);
    });
});

describe('DELETE /api/admin/sessions/:id', () => {
    test('revokes a session by its opaque id', async () => {
        const { request, sessionStore } = await getSetup();

        const inserted = await sessionStore.insertSession({
            sid: 'to-revoke',
            sess: { user: { id: 1 } },
            expired: new Date(Date.now() + 60_000),
        });

        await request
            .delete(`/api/admin/sessions/${inserted.id}`)
            .set('Content-Type', 'application/json')
            .expect(200);

        const remaining = await sessionStore.getAll();
        expect(remaining.find((s) => s.id === inserted.id)).toBeUndefined();
    });

    test('does not revoke other sessions', async () => {
        const { request, sessionStore } = await getSetup();

        const keeper = await sessionStore.insertSession({
            sid: 'keeper',
            sess: { user: { id: 1 } },
            expired: new Date(Date.now() + 60_000),
        });
        const toRevoke = await sessionStore.insertSession({
            sid: 'to-revoke',
            sess: { user: { id: 2 } },
            expired: new Date(Date.now() + 60_000),
        });

        await request
            .delete(`/api/admin/sessions/${toRevoke.id}`)
            .set('Content-Type', 'application/json')
            .expect(200);

        const remaining = await sessionStore.getAll();
        expect(remaining.find((s) => s.id === keeper.id)).toBeDefined();
    });

    test('returns 200 even when the session id does not exist', async () => {
        const { request } = await getSetup();

        await request
            .delete('/api/admin/sessions/non-existent-id')
            .set('Content-Type', 'application/json')
            .expect(200);
    });
});
