import type {
    IEventStore,
    IFeatureCollaboratorsReadModel,
    IUnleashStores,
    IUserStore,
} from '../../../types/index.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';

let stores: IUnleashStores;
let db: ITestDb;
let eventStore: IEventStore;
let usersStore: IUserStore;
let featureCollaboratorsReadModel: IFeatureCollaboratorsReadModel;

beforeAll(async () => {
    db = await dbInit('feature_collaborators_read_model', getLogger);
    stores = db.stores;
    eventStore = stores.eventStore;
    usersStore = stores.userStore;
    featureCollaboratorsReadModel = stores.featureCollaboratorsReadModel;
});

afterAll(async () => {
    await db.destroy();
});

test('Should return collaborators according to their activity order', async () => {
    const user1 = await usersStore.insert({
        name: 'User One',
        email: 'user1@example.com',
    });
    const user2 = await usersStore.insert({
        name: 'User Two',
        email: 'user2@example.com',
    });
    // first event on our feature
    await eventStore.store({
        featureName: 'featureA',
        createdByUserId: user1.id,
        type: 'feature-created',
        createdBy: 'irrelevant',
        ip: '::1',
    });
    // first event on another feature
    await eventStore.store({
        featureName: 'featureB',
        createdByUserId: user1.id,
        type: 'feature-created',
        createdBy: 'irrelevant',
        ip: '::1',
    });
    // second event on our feature
    await eventStore.store({
        featureName: 'featureA',
        createdByUserId: user2.id,
        type: 'feature-updated',
        createdBy: 'irrelevant',
        ip: '::1',
    });

    const collaborators =
        await featureCollaboratorsReadModel.getFeatureCollaborators('featureA');

    expect(collaborators).toMatchObject([
        { id: 2, name: 'User Two', imageUrl: expect.any(String) },
        { id: 1, name: 'User One', imageUrl: expect.any(String) },
    ]);
});
