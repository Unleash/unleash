export interface ISuggestChangeSet {
    id: number;
    state: string;
    project: string;
    environment: string;
    createdBy: string;
    createdAt: Date;
    changes: ISuggestChange[];
    events: ISuggestChangeEvent[];
}

export interface ISuggestChange {
    id: number;
    action: string;
    feature: string;
    payload?: boolean;
}

export enum SuggestChangeEvent {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CLOSED = 'CLOSED',
}

export interface ISuggestChangeEvent {
    id: number;
    event: SuggestChangeEvent;
    data: unknown;
    createdBy: string;
    createdAt: Date;
}
