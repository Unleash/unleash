export interface IIncomingWebhook {
    id: number;
    enabled: boolean;
    name: string;
    createdAt: string;
    createdByUserId: number;
    description: string;
}

export interface IIncomingWebhookToken {
    id: number;
    name: string;
    incomingWebhookId: number;
    createdAt: string;
    createdByUserId: number;
}
