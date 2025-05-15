import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';

let app: IUnleashTest;
let db: ITestDb;

const PATH = '/api/admin/constraints/validate';

beforeAll(async () => {
    db = await dbInit('constraints', getLogger);
    app = await setupAppWithCustomConfig(db.stores, {
        experimental: {
            flags: {
                strictSchemaValidation: true,
            },
        },
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should reject invalid constraints', async () => {
    await app.request.post(PATH).send({}).expect(400);
    await app.request.post(PATH).send({ a: 1 }).expect(400);
    await app.request.post(PATH).send({ operator: 'IN' }).expect(400);
    await app.request.post(PATH).send({ contextName: 'a' }).expect(400);
});

test('should accept valid constraints', async () => {
    await app.request
        .post(PATH)
        .send({ contextName: 'environment', operator: 'NUM_EQ', value: 1 })
        .expect(204);
    await app.request
        .post(PATH)
        .send({ contextName: 'environment', operator: 'IN', values: ['a'] })
        .expect(204);
});

test('should allow unknown constraints if their values are valid', async () => {
    await app.request
        .post(PATH)
        .send({
            contextName: 'not-a-default-context-value',
            operator: 'NUM_EQ',
            value: 1,
        })
        .expect(204);
});

test('should block unknown constraints if their values are invalid', async () => {
    await app.request
        .post(PATH)
        .send({
            contextName: 'not-a-default-context-value',
            operator: 'IN',
            value: 1,
        })
        .expect(400);
});
