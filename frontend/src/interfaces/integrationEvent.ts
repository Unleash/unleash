import type { EventSchema } from 'openapi';

export type IntegrationEvent = {
    id: string;
    integrationId: number;
    createdAt: string;
    state: 'success' | 'failed' | 'successWithErrors';
    stateDetails: string;
    event: EventSchema;
    details: Record<string, unknown>;
};

export type IntegrationEvents = {
    integrationEvents: IntegrationEvent[];
};
