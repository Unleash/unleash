import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import type { Logger } from '../logger';
import type { ISession, ISessionStore } from '../types/stores/session-store';

export default class SessionService {
    private logger: Logger;

    private sessionStore: ISessionStore;

    constructor(
        { sessionStore }: Pick<IUnleashStores, 'sessionStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('lib/services/session-service.ts');
        this.sessionStore = sessionStore;
    }

    async getActiveSessions(): Promise<ISession[]> {
        return this.sessionStore.getActiveSessions();
    }

    async getSessionsForUser(userId: number): Promise<ISession[]> {
        return this.sessionStore.getSessionsForUser(userId);
    }

    async getSession(sid: string): Promise<ISession> {
        return this.sessionStore.get(sid);
    }

    async deleteSessionsForUser(userId: number): Promise<void> {
        return this.sessionStore.deleteSessionsForUser(userId);
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
}

module.exports = SessionService;
