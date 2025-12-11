import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { UserSubscriptionsReadModel } from './user-subscriptions-read-model.js';
import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type.js';
import { SUBSCRIPTION_TYPES } from './user-subscriptions-read-model-type.js';
import type { IUnleashStores, IUserStore } from '../../types/index.js';
import type { IUserUnsubscribeStore } from './user-unsubscribe-store-type.js';

let db: ITestDb;
let stores: IUnleashStores;
let userStore: IUserStore;
let userUnsubscribeStore: IUserUnsubscribeStore;
let userSubscriptionsReadModel: IUserSubscriptionsReadModel;

const subscription =
    'productivity-report' satisfies (typeof SUBSCRIPTION_TYPES)[number];

beforeAll(async () => {
    db = await dbInit('user_subscriptions_read_model_test', getLogger);
    stores = db.stores;
    userStore = stores.userStore;
    userUnsubscribeStore = stores.userUnsubscribeStore;
    userSubscriptionsReadModel = new UserSubscriptionsReadModel(db.rawDatabase);
});

beforeEach(async () => {
    await db.stores.userStore.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

describe('User subscription read model', () => {
    test('returns subscribed and unsubscribed users', async () => {
        const user1 = await userStore.insert({
            email: 'user1@example.com',
            name: 'User One',
        });
        // user seen
        await userStore.successfullyLogin(user1);
        const user2 = await userStore.insert({
            email: 'user2@example.com',
            name: 'User Two',
        });
        // never seen
        const _user3 = await userStore.insert({
            email: 'user3@example.com',
            name: 'User Three',
        });

        // unsubscribe
        await userUnsubscribeStore.insert({
            userId: user2.id,
            subscription,
        });

        const subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);

        expect(subscribers).toHaveLength(1);
        expect(subscribers).toEqual(
            expect.arrayContaining([
                { email: 'user1@example.com', name: 'User One' },
            ]),
        );

        const unsubscribers =
            await userSubscriptionsReadModel.getUnsubscribedUsers(subscription);
        expect(unsubscribers).toEqual(
            expect.arrayContaining([
                { email: 'user2@example.com', name: 'User Two' },
            ]),
        );
    });

    test('reflects changes after unsubscribe and resubscribe', async () => {
        const user = await userStore.insert({
            email: 'user7@example.com',
            name: 'User Seven',
        });
        await userStore.successfullyLogin(user);

        let subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toEqual(
            expect.arrayContaining([
                { email: 'user7@example.com', name: 'User Seven' },
            ]),
        );

        await userUnsubscribeStore.insert({
            userId: user.id,
            subscription,
        });
        subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).not.toEqual(
            expect.arrayContaining([
                { email: 'user7@example.com', name: 'User Seven' },
            ]),
        );

        await userUnsubscribeStore.delete({
            userId: user.id,
            subscription,
        });

        subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toEqual(
            expect.arrayContaining([
                { email: 'user7@example.com', name: 'User Seven' },
            ]),
        );
    });

    test('should not include deleted users', async () => {
        const user = await userStore.insert({
            email: 'todelete@getunleash.io',
            name: 'To Delete',
        });

        await userStore.delete(user.id);

        const subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);

        expect(subscribers).toHaveLength(0);
    });
});

describe('User subscription read model', () => {
    test('returns all user subscriptions if user has not unsubscribed', async () => {
        const user = await userStore.insert({
            email: 'user4@example.com',
            name: 'User Four',
        });

        const userSubscriptions =
            await userSubscriptionsReadModel.getUserSubscriptions(user.id);

        expect(userSubscriptions).toEqual(SUBSCRIPTION_TYPES);
    });

    test('returns correct subscriptions if user unsubscribed and resubscribed', async () => {
        const user = await userStore.insert({
            email: 'user5@example.com',
            name: 'User Five',
        });
        const subscription =
            'productivity-report' satisfies (typeof SUBSCRIPTION_TYPES)[number];

        await userUnsubscribeStore.insert({
            userId: user.id,
            subscription,
        });

        const userSubscriptions =
            await userSubscriptionsReadModel.getUserSubscriptions(user.id);

        expect(userSubscriptions).not.toContain(subscription);

        await userUnsubscribeStore.delete({
            userId: user.id,
            subscription,
        });

        const userSubscriptionsAfterResubscribe =
            await userSubscriptionsReadModel.getUserSubscriptions(user.id);

        expect(userSubscriptionsAfterResubscribe).toContain(subscription);
    });
});
