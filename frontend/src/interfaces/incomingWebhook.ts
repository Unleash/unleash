export interface IIncomingWebhook {
    id: number;
    enabled: boolean;
    name: string;
    createdAt: string;
    createdByUserId: number;
    description: string;
    tokens: IIncomingWebhookToken[];
}

export interface IIncomingWebhookToken {
    id: number;
    name: string;
    incomingWebhookId: number;
    createdAt: string;
    createdByUserId: number;
}

type EventSource = 'incoming-webhook';

export interface IIncomingWebhookEvent {
    id: number;
    payload: Record<string, unknown>;
    createdAt: string;
    source: EventSource;
    sourceId: number;
    tokenName: string;
}
