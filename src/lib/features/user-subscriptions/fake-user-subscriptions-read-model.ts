import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type.js';

export class FakeUserSubscriptionsReadModel
    implements IUserSubscriptionsReadModel
{
    async getSubscribedUsers(_subscription: string) {
        return [];
    }

    async getUnsubscribedUsers(_subscription: string) {
        return [];
    }

    async getUserSubscriptions() {
        return ['productivity-report'];
    }
}
