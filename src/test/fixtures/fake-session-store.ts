import { ISession, ISessionStore } from '../../lib/types/stores/session-store';

export default class FakeSessionStore implements ISessionStore {
    private sessions: ISession[] = [];

    async getActiveSessions(): Promise<ISession[]> {
        return this.sessions.filter((session) => session.expired != null);
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.sessions.some((s) => s.sid === key);
    }

    async getAll(): Promise<ISession[]> {
        return this.sessions;
    }

    async getSessionsForUser(userId: number): Promise<ISession[]> {
        return this.sessions.filter(
            (session) => session.sess.user.id === userId,
        );
    }

    async deleteSessionsForUser(userId: number): Promise<void> {
        this.sessions = this.sessions.filter(
            (session) => session.sess.user.id !== userId,
        );
    }

    async deleteAll(): Promise<void> {
        this.sessions = [];
    }

    async delete(sid: string): Promise<void> {
        this.sessions.splice(
            this.sessions.findIndex((s) => s.sid === sid),
            1,
        );
    }

    async get(sid: string): Promise<ISession> {
        return this.sessions.find((s) => s.sid === sid);
    }

    async insertSession(data: Omit<ISession, 'createdAt'>): Promise<ISession> {
        const session = { ...data, createdAt: new Date() };
        this.sessions.push(session);
        return session;
    }
}
