import type { Store } from './store.js';

export interface ISession {
    id: string;
    sid: string;
    sess: any;
    createdAt: Date;
    expired?: Date;
}

export interface ISessionWithUserInfo extends ISession {
    imageUrl: string | null;
    seenAt: Date | null;
}

export interface ISessionStore extends Store<ISession, string> {
    getActiveSessions(): Promise<ISession[]>;
    getActiveSessionsWithUserInfo(): Promise<ISessionWithUserInfo[]>;
    getSessionsForUser(userId: number): Promise<ISession[]>;
    deleteSessionsForUser(userId: number): Promise<void>;
    insertSession(data: Omit<ISession, 'createdAt' | 'id'>): Promise<ISession>;
    deleteSessionById(id: string): Promise<void>;
    getSessionsCount(): Promise<{ userId: number; count: number }[]>;
    getMaxSessionsCount(): Promise<number>;
}
