export interface IActiveSession {
    id: string;
    userId: number | null;
    username: string | null;
    email: string | null;
    ip: string | null;
    browser: string | null;
    deviceType: 'desktop' | 'mobile' | 'tablet' | null;
    createdAt: string;
    expiredAt: string | null;
    current: boolean;
}
