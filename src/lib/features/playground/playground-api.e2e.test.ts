import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../../test/e2e/helpers/test-helper.js';
import type { IUnleashStores } from '../../types/index.js';
import getLogger from '../../../test/fixtures/no-logger.js';

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

    app = await setupAppWithCustomConfig(stores, {}, db.rawDatabase);
});

afterAll(async () => {
    await db.destroy();
});

test('strips invalid context properties from input before using it', async () => {
    const validData = {
        appName: 'test',
    };

    const inputContext = {
        invalid: {},
        ...validData,
    };

    const { body } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            context: inputContext,
            environments: ['production'],
            projects: '*',
        })
        .expect(200);

    const evaluatedContext =
        body.features[0].environments.production[0].context;

    expect(evaluatedContext).toStrictEqual(validData);
});

test('returns the input context exactly as it came in, even if invalid values have been removed for the evaluation', async () => {
    const invalidData = {
        invalid: {},
    };

    const inputContext = {
        ...invalidData,
        appName: 'test',
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
});

test('adds all removed top-level context properties to the list of warnings', async () => {
    const invalidData = {
        invalid1: {},
        invalid2: {},
    };

    const inputContext = {
        ...invalidData,
        appName: 'test',
    };

    const { body } = await app.request
        .post('/api/admin/playground/advanced')
        .send({
            context: inputContext,
            environments: ['production'],
            projects: '*',
        })
        .expect(200);

    const warned = body.warnings.invalidContextProperties;
    const invalidKeys = Object.keys(invalidData);

    expect(warned).toEqual(expect.arrayContaining(invalidKeys));
    expect(invalidKeys).toEqual(expect.arrayContaining(warned));
});
