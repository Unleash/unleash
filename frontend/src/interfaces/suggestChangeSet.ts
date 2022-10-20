export interface ISuggestChangeSet {
    id: number;
    state: string;
    project: string;
    environment: string;
    createdBy?: string;
    createdAt?: Date;
    changes?: ISuggestChange[];
    events?: ISuggestChangeEvent[];
}

export interface ISuggestChange {
    id: number;
    action: SuggestChangeAction;
    feature: string;
    payload?: unknown;
    createdBy?: string;
    createdAt?: Date;
}

export enum SuggestChangeSetEvent {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CLOSED = 'CLOSED',
}

export enum SuggestChangeAction {
    UPDATE_ENABLED = 'updateEnabled',
    ADD_STRATEGY = 'strategyAdd',
    UPDATE_STRATEGY = 'strategyUpdate',
    DELETE_STRATEGY = 'strategyDelete',
}

export enum SuggestChangeEvent {
    UPDATE_ENABLED = 'updateFeatureEnabledEvent',
    ADD_STRATEGY = 'addStrategyEvent',
    UPDATE_STRATEGY = 'updateStrategyEvent',
    DELETE_STRATEGY = 'deleteStrategyEvent',
}

export interface ISuggestChangeEvent {
    id: number;
    event: SuggestChangeSetEvent;
    data: ISuggestChangeEventData;
    createdBy?: string;
    createdAt?: Date;
}

export interface ISuggestChangeEventData {
    feature: string;
    data: unknown;
}
