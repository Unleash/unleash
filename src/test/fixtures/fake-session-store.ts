import SessionStore, { ISession } from '../../lib/db/session-store';
import noLoggerProvider from './no-logger';

export default class FakeSessionStore extends SessionStore {
    private sessions: ISession[] = [];

    constructor() {
        super(undefined, undefined, noLoggerProvider);
    }

    async getActiveSessions(): Promise<ISession[]> {
        return this.sessions.filter(session => session.expired != null);
    }

    async getSessionsForUser(userId: number): Promise<ISession[]> {
        return this.sessions.filter(session => session.sess.user.id === userId);
    }

    async deleteSessionsForUser(userId: number): Promise<void> {
        this.sessions = this.sessions.filter(
            session => session.sess.user.id !== userId,
        );
    }
}
