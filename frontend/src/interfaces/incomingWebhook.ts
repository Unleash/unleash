export interface IIncomingWebhook {
    id: number;
    enabled: boolean;
    name: string;
    createdAt: string;
    createdByUserId: number;
}

export interface IIncomingWebhookToken {
    id: number;
    name: string;
    incomingWebhookId: number;
    createdAt: string;
    createdByUserId: number;
}
