import { describe, test, expect, beforeEach } from 'vitest';
import SessionService from './session-service.js';
import FakeSessionStore from '../../test/fixtures/fake-session-store.js';
import { createTestConfig } from '../../test/config/test-config.js';

const config = createTestConfig();

function makeService() {
    const sessionStore = new FakeSessionStore();
    const service = new SessionService({ sessionStore }, config);
    return { service, sessionStore };
}

describe('SessionService', () => {
    describe('getActiveSessionsWithUserInfo', () => {
        test('returns sessions that have an expiry set', async () => {
            const { service, sessionStore } = makeService();
            await sessionStore.insertSession({
                sid: 'active-sid',
                sess: { user: { id: 1, name: 'Alice' } },
                expired: new Date(Date.now() + 60_000),
            });
            await sessionStore.insertSession({
                sid: 'no-expiry-sid',
                sess: { user: { id: 2, name: 'Bob' } },
            });

            const sessions = await service.getActiveSessionsWithUserInfo();

            expect(sessions).toHaveLength(1);
            expect(sessions[0].sess.user.name).toBe('Alice');
        });

        test('returns imageUrl and seenAt from user info', async () => {
            const { service, sessionStore } = makeService();
            await sessionStore.insertSession({
                sid: 'sid-1',
                sess: { user: { id: 1 } },
                expired: new Date(Date.now() + 60_000),
            });

            const sessions = await service.getActiveSessionsWithUserInfo();

            expect(sessions[0]).toHaveProperty('imageUrl');
            expect(sessions[0]).toHaveProperty('seenAt');
        });
    });

    describe('deleteSessionById', () => {
        test('removes the session with the matching id', async () => {
            const { service, sessionStore } = makeService();
            const inserted = await sessionStore.insertSession({
                sid: 'sid-to-delete',
                sess: { user: { id: 1 } },
                expired: new Date(Date.now() + 60_000),
            });

            await service.deleteSessionById(inserted.id);

            const all = await sessionStore.getAll();
            expect(all.find((s) => s.id === inserted.id)).toBeUndefined();
        });

        test('does not remove other sessions', async () => {
            const { service, sessionStore } = makeService();
            await sessionStore.insertSession({
                sid: 'keeper',
                sess: { user: { id: 1 } },
                expired: new Date(Date.now() + 60_000),
            });
            const toDelete = await sessionStore.insertSession({
                sid: 'to-delete',
                sess: { user: { id: 2 } },
                expired: new Date(Date.now() + 60_000),
            });

            await service.deleteSessionById(toDelete.id);

            const all = await sessionStore.getAll();
            expect(all).toHaveLength(1);
            expect(all[0].sid).toBe('keeper');
        });

        test('is a no-op when id does not exist', async () => {
            const { service, sessionStore } = makeService();
            await sessionStore.insertSession({
                sid: 'existing',
                sess: {},
                expired: new Date(Date.now() + 60_000),
            });

            await expect(
                service.deleteSessionById('non-existent-id'),
            ).resolves.not.toThrow();

            expect(await sessionStore.getAll()).toHaveLength(1);
        });
    });

    describe('insertSession', () => {
        test('assigns a unique id to each session', async () => {
            const { service } = makeService();
            const s1 = await service.insertSession({
                sid: 'sid-1',
                sess: {},
            });
            const s2 = await service.insertSession({
                sid: 'sid-2',
                sess: {},
            });

            expect(s1.id).toBeTruthy();
            expect(s2.id).toBeTruthy();
            expect(s1.id).not.toBe(s2.id);
        });
    });

    describe('deleteStaleSessionsForUser', () => {
        test('removes oldest sessions beyond the max allowed', async () => {
            const { service, sessionStore } = makeService();
            const userId = 42;
            const sess = { user: { id: userId } };

            for (let i = 0; i < 4; i++) {
                await sessionStore.insertSession({
                    sid: `sid-${i}`,
                    sess,
                    expired: new Date(Date.now() + 60_000),
                });
            }

            const deleted = await service.deleteStaleSessionsForUser(userId, 2);

            expect(deleted).toBe(2);
            const remaining = await sessionStore.getSessionsForUser(userId);
            expect(remaining).toHaveLength(2);
        });
    });
});
