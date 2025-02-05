import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type';

export class FakeUserSubscriptionsReadModel
    implements IUserSubscriptionsReadModel
{
    async getSubscribedUsers(subscription: string) {
        return [];
    }

    async getUnsubscribedUsers(subscription: string) {
        return [];
    }

    async getUserSubscriptions() {
        return ['productivity-report'];
    }
}
