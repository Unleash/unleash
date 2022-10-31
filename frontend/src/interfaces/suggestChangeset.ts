export interface ISuggestChangeset {
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
    changes?: ISuggestChange[];
    events?: ISuggestChangeEvent[];
}

export interface ISuggestChange {
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

export enum SuggestChangesetEvent {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CLOSED = 'CLOSED',
}

export enum SuggestChangeEvent {
    UPDATE_ENABLED = 'updateFeatureEnabledEvent',
    ADD_STRATEGY = 'addStrategyEvent',
    UPDATE_STRATEGY = 'updateStrategyEvent',
    DELETE_STRATEGY = 'deleteStrategyEvent',
}

export interface ISuggestChangeEvent {
    id: number;
    event: SuggestChangesetEvent;
    data: ISuggestChangeEventData;
    createdBy?: string;
    createdAt?: Date;
}

export interface ISuggestChangeEventData {
    feature: string;
    data: unknown;
}
