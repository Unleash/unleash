import {
    type IEventStore,
    type IUnleashConfig,
    type IUnleashStores,
    type IUserStore,
    TEST_AUDIT_USER,
} from '../../types';
import type { UserSubscriptionsService } from './user-subscriptions-service';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import { createTestConfig } from '../../../test/config/test-config';
import getLogger from '../../../test/fixtures/no-logger';
import { createUserSubscriptionsService } from './createUserSubscriptionsService';
import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type';

let stores: IUnleashStores;
let db: ITestDb;
let userStore: IUserStore;
let userSubscriptionService: UserSubscriptionsService;
let userSubscriptionsReadModel: IUserSubscriptionsReadModel;
let eventsStore: IEventStore;
let config: IUnleashConfig;

beforeAll(async () => {
    db = await dbInit('user_subscriptions', getLogger);
    stores = db.stores;
    config = createTestConfig({});

    userStore = stores.userStore;
    userSubscriptionService = createUserSubscriptionsService(config)(
        db.rawDatabase,
    );
    userSubscriptionsReadModel = db.stores.userSubscriptionsReadModel;
    eventsStore = db.stores.eventStore;
});

beforeEach(async () => {
    await userStore.deleteAll();
});

afterAll(async () => {
    await db.destroy();
});

test('Subscribe and unsubscribe', async () => {
    const user = await userStore.insert({
        email: 'test@getunleash.io',
        name: 'Sample Name',
    });

    const subscribers = await userSubscriptionsReadModel.getSubscribedUsers(
        'productivity-report',
    );
    expect(subscribers).toMatchObject([
        { email: 'test@getunleash.io', name: 'Sample Name' },
    ]);

    const userSubscriptions =
        await userSubscriptionService.getUserSubscriptions(user.id);
    expect(userSubscriptions).toMatchObject(['productivity-report']);

    await userSubscriptionService.unsubscribe(
        user.id,
        'productivity-report',
        TEST_AUDIT_USER,
    );

    const noSubscribers = await userSubscriptionsReadModel.getSubscribedUsers(
        'productivity-report',
    );
    expect(noSubscribers).toMatchObject([]);

    const noUserSubscriptions =
        await userSubscriptionService.getUserSubscriptions(user.id);
    expect(noUserSubscriptions).toMatchObject([]);
});

test('Event log for subscription actions', async () => {
    const user = await userStore.insert({
        email: 'test@getunleash.io',
        name: 'Sample Name',
    });

    await userSubscriptionService.unsubscribe(
        user.id,
        'productivity-report',
        TEST_AUDIT_USER,
    );

    const unsubscribeEvent = (await eventsStore.getAll())[0];

    expect(unsubscribeEvent).toEqual(
        expect.objectContaining({
            type: 'user-preference-updated',
            data: {
                subscription: 'productivity-report',
                action: 'unsubscribed',
            },
        }),
    );

    await userSubscriptionService.subscribe(
        user.id,
        'productivity-report',
        TEST_AUDIT_USER,
    );

    const subscribeEvent = (await eventsStore.getAll())[0];

    expect(subscribeEvent).toEqual(
        expect.objectContaining({
            type: 'user-preference-updated',
            data: {
                subscription: 'productivity-report',
                action: 'subscribed',
            },
        }),
    );
});
