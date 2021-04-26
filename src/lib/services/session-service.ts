import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import SessionStore, { ISession } from '../db/session-store';

export default class SessionService {
    private logger: Logger;

    private sessionStore: SessionStore;

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
        return this.sessionStore.getSession(sid);
    }

    async deleteSessionsForUser(userId: number): Promise<void> {
        return this.sessionStore.deleteSessionsForUser(userId);
    }

    async deleteSession(sid: string): Promise<void> {
        return this.sessionStore.deleteSession(sid);
    }

    async insertSession({
        sid,
        sess,
    }: Pick<ISession, 'sid' | 'sess'>): Promise<ISession> {
        return this.sessionStore.insertSession({ sid, sess });
    }
}

module.exports = SessionService;
