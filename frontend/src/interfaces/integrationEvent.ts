import type { IEvent } from './event';

export type IntegrationEvent = {
    id: string;
    integrationId: number;
    createdAt: string;
    state: 'success' | 'failed' | 'successWithErrors';
    stateDetails: string;
    event: IEvent;
    details: Record<string, unknown>;
};

export type IntegrationEvents = {
    integrationEvents: IntegrationEvent[];
};
