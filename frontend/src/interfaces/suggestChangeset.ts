export interface IChangeRequest {
    id: number;
    state:
        | 'CREATED'
        | 'UPDATED'
        | 'SUBMITTED'
        | 'APPROVED'
        | 'REJECTED'
        | 'CLOSED';
    project: string;
    environment: string;
    createdBy?: string;
    createdAt?: Date;
    changes?: IChangeRequestEvent[];
}

export interface IChangeRequestEvent {
    id: number;
    action:
        | 'updateEnabled'
        | 'strategyAdd'
        | 'strategyUpdate'
        | 'strategyDelete';
    feature: string;
    payload?: unknown;
    createdBy?: string;
    createdAt?: Date;
}

export enum ChangeRequestEvent {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CLOSED = 'CLOSED',
}
