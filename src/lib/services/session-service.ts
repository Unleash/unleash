import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import type { Logger } from '../logger.js';
import type { ISession, ISessionStore } from '../types/stores/session-store.js';
import { compareDesc, minutesToMilliseconds } from 'date-fns';
import memoizee from 'memoizee';

export default class SessionService {
    private logger: Logger;

    private sessionStore: ISessionStore;
    private resolveMaxSessions: () => Promise<number>;

    constructor(
        { sessionStore }: Pick<IUnleashStores, 'sessionStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('lib/services/session-service.ts');
        this.sessionStore = sessionStore;

        this.resolveMaxSessions = memoizee(
            async () => await this.sessionStore.getMaxSessionsCount(),
            {
                promise: true,
                maxAge: minutesToMilliseconds(1),
            },
        );
    }

    async getActiveSessions(): Promise<ISession[]> {
        return this.sessionStore.getActiveSessions();
    }

    async getSessionsForUser(userId: number): Promise<ISession[]> {
        return this.sessionStore.getSessionsForUser(userId);
    }

    async getSession(sid: string): Promise<ISession | undefined> {
        return this.sessionStore.get(sid);
    }

    async deleteSessionsForUser(userId: number): Promise<void> {
        return this.sessionStore.deleteSessionsForUser(userId);
    }

    async deleteStaleSessionsForUser(
        userId: number,
        maxSessions: number,
    ): Promise<number> {
        const userSessions: ISession[] =
            await this.sessionStore.getSessionsForUser(userId);
        const newestFirst = userSessions.sort((a, b) =>
            compareDesc(a.createdAt, b.createdAt),
        );
        const sessionsToDelete = newestFirst.slice(maxSessions);
        await Promise.all(
            sessionsToDelete.map((session) =>
                this.sessionStore.delete(session.sid),
            ),
        );
        return sessionsToDelete.length;
    }

    async deleteSession(sid: string): Promise<void> {
        return this.sessionStore.delete(sid);
    }

    async insertSession({
        sid,
        sess,
    }: Pick<ISession, 'sid' | 'sess'>): Promise<ISession> {
        return this.sessionStore.insertSession({ sid, sess });
    }

    async getSessionsCount() {
        return Object.fromEntries(
            (await this.sessionStore.getSessionsCount()).map(
                ({ userId, count }) => [userId, count],
            ),
        );
    }

    async getMaxSessionsCount() {
        return this.resolveMaxSessions();
    }
}
