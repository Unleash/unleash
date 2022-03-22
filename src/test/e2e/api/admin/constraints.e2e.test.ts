import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { setupApp } from '../../helpers/test-helper';

let app;
let db;

const PATH = '/api/admin/constraints/validate';

beforeAll(async () => {
    db = await dbInit('constraints', getLogger);
    app = await setupApp(db.stores);
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
