export interface ISignOnEvent {
    id: number;
    username: string;
    auth_type: string;
    created_at: Date;
    successful: boolean;
    ip?: string;
    failure_reason?: string;
}
