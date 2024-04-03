import type { IUnleashStores } from '../../../../lib/types';
import dbInit, { type ITestDb } from '../../helpers/database-init';
import { type IUnleashTest, setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

let stores: IUnleashStores;
let db: ITestDb;
let app: IUnleashTest;

const flag = {
    name: 'test-flag',
    enabled: true,
    strategies: [{ name: 'default' }],
    createdByUserId: 9999,
};

beforeAll(async () => {
    db = await dbInit('playground_api', getLogger);
    stores = db.stores;

    await stores.featureToggleStore.create('default', flag);

    app = await setupApp(stores);
});

afterAll(async () => {
    await db.destroy();
});

test('strips invalid context properties from input before using it', async () => {
    const invalidJsonTypes = {
        array: [],
        true: true,
        false: false,
        number: 123,
        null: null,
    };

    const validValues = {
        appName: 'test',
    };

    const inputContext = {
        ...invalidJsonTypes,
        ...validValues,
    };

    const { body } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            context: inputContext,
            environments: ['production'],
            projects: '*',
        })
        .expect(200);

    expect(body.input.context).toMatchObject(inputContext);

    const evaluatedContext =
        body.features[0].environments.production[0].context;

    expect(
        ['array', 'true', 'false', 'number', 'null'].every(
            (property) => !evaluatedContext.hasOwnProperty(property),
        ),
    ).toBeTruthy();
});
