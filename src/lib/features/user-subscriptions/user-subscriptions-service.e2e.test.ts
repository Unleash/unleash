import {
    type IUnleashConfig,
    type IUnleashStores,
    type IUser,
    TEST_AUDIT_USER,
} from '../../types';
import type UserSubscriptionService from './user-subscriptions-service';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import { createTestConfig } from '../../../test/config/test-config';
import getLogger from '../../../test/fixtures/no-logger';
import { createUserSubscriptionsService } from './createUserSubscriptionsService';
import type { IUserSubscriptionsReadModel } from './user-subscriptions-read-model-type';

let stores: IUnleashStores;
let db: ITestDb;
let userSubscriptionService: UserSubscriptionService;
let userSubscriptionsReadModel: IUserSubscriptionsReadModel;
let config: IUnleashConfig;
let user: IUser;

beforeAll(async () => {
    db = await dbInit('user_subscriptions', getLogger);
    stores = db.stores;
    config = createTestConfig({});

    userSubscriptionService = createUserSubscriptionsService(config)(
        db.rawDatabase,
    );
    userSubscriptionsReadModel = db.stores.userSubscriptionsReadModel;

    user = await stores.userStore.insert({
        email: 'test@getunleash.io',
        name: 'Sample Name',
    });
});

afterAll(async () => {
    await db.destroy();
});

test('Subscribe and unsubscribe', async () => {
    const subscribers = await userSubscriptionsReadModel.getSubscribedUsers(
        'productivity-report',
    );
    expect(subscribers).toMatchObject([
        { email: 'test@getunleash.io', name: 'Sample Name' },
    ]);

    const userSubscriptions =
        await userSubscriptionsReadModel.getUserSubscriptions(user.id);
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
        await userSubscriptionsReadModel.getUserSubscriptions(user.id);
    expect(noUserSubscriptions).toMatchObject([]);
});
