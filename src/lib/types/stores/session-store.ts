import { Store } from './store';

export interface ISession {
    sid: string;
    sess: any;
    createdAt: Date;
    expired?: Date;
}

export interface ISessionStore extends Store<ISession, string> {
    getActiveSessions(): Promise<ISession[]>;
    getSessionsForUser(userId: number): Promise<ISession[]>;
    deleteSessionsForUser(userId: number): Promise<void>;
    insertSession(data: Omit<ISession, 'createdAt'>): Promise<ISession>;
}
