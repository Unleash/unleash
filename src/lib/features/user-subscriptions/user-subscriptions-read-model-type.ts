export type Subscriber = {
    name: string;
    email: string;
};

export interface IUserSubscriptionsReadModel {
    getSubscribedUsers(subscription: string): Promise<Subscriber[]>;
    getUnsubscribedUsers(subscription: string): Promise<Subscriber[]>;
    getUserSubscriptions(userId: number): Promise<string[]>;
}

export const SUBSCRIPTION_TYPES = ['productivity-report'] as const;
