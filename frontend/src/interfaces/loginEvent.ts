export interface ILoginEvent {
    id: number;
    username: string;
    auth_type: string;
    type: 'login' | 'logout';
    created_at: Date;
    successful: boolean;
    ip?: string;
    failure_reason?: string;
}
