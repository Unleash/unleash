import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { UserSubscriptionsReadModel } from './user-subscriptions-read-model';
import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type';
import EventEmitter from 'events';
import { SUBSCRIPTION_TYPES } from './user-subscriptions-read-model-type';
import type { IUnleashStores, IUserStore } from '../../types';

let db: ITestDb;
let stores: IUnleashStores;
let userSubscriptionsReadModel: IUserSubscriptionsReadModel;
let userStore: IUserStore;

const subscription =
    'productivity-report' satisfies (typeof SUBSCRIPTION_TYPES)[number];

beforeAll(async () => {
    db = await dbInit('user_subscriptions_read_model_test', getLogger);
    stores = db.stores;
    userStore = stores.userStore;
    const eventBus = new EventEmitter();
    userSubscriptionsReadModel = new UserSubscriptionsReadModel(
        db.rawDatabase,
        eventBus,
    );
});

afterAll(async () => {
    await db.destroy();
});

describe('getSubscribedUsers', () => {
    test('returns users that did not unsubscribe', async () => {
        const user1 = await userStore.insert({
            email: 'user1@example.com',
            name: 'User One',
        });
        const user2 = await userStore.insert({
            email: 'user2@example.com',
            name: 'User Two',
        });
        const user3 = await userStore.insert({
            email: 'user3@example.com',
            name: 'User Three',
        });

        await db.rawDatabase('user_unsubscription').insert({
            user_id: user2.id,
            subscription,
        });

        const subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);

        expect(subscribers).toHaveLength(2);
        expect(subscribers).toEqual(
            expect.arrayContaining([
                { email: 'user1@example.com', name: 'User One' },
                { email: 'user3@example.com', name: 'User Three' },
            ]),
        );
    });

    test('reflects changes after unsubscribe and resubscribe', async () => {
        const user = await userStore.insert({
            email: 'user7@example.com',
            name: 'User Seven',
        });

        let subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toEqual(
            expect.arrayContaining([
                { email: 'user7@example.com', name: 'User Seven' },
            ]),
        );

        await db.rawDatabase('user_unsubscription').insert({
            user_id: user.id,
            subscription,
        });

        subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).not.toEqual(
            expect.arrayContaining([
                { email: 'user7@example.com', name: 'User Seven' },
            ]),
        );

        await db
            .rawDatabase('user_unsubscription')
            .where({
                user_id: user.id,
                subscription,
            })
            .del();

        subscribers =
            await userSubscriptionsReadModel.getSubscribedUsers(subscription);
        expect(subscribers).toEqual(
            expect.arrayContaining([
                { email: 'user7@example.com', name: 'User Seven' },
            ]),
        );
    });
});

describe('getUserSubscriptions', () => {
    test(' returns all subscriptions if user has not unsubscribed', async () => {
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

        await db.rawDatabase('user_unsubscription').insert({
            user_id: user.id,
            subscription,
        });

        const userSubscriptions =
            await userSubscriptionsReadModel.getUserSubscriptions(user.id);

        expect(userSubscriptions).not.toContain(subscription);

        await db
            .rawDatabase('user_unsubscription')
            .where({
                user_id: user.id,
                subscription,
            })
            .del();

        const userSubscriptionsAfterResubscribe =
            await userSubscriptionsReadModel.getUserSubscriptions(user.id);

        expect(userSubscriptionsAfterResubscribe).toContain(subscription);
    });
});
