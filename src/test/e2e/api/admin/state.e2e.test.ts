import dbInit from '../../helpers/database-init';
import { setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

const importData = require('../../../examples/import.json');

let app;
let db;

beforeAll(async () => {
    db = await dbInit('state_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('exports strategies and features as json by default', async () => {
    expect.assertions(2);

    return app.request
        .get('/api/admin/state/export')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect('features' in res.body).toBe(true);
            expect('strategies' in res.body).toBe(true);
        });
});

test('exports strategies and features as yaml', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/state/export?format=yaml')
        .expect('Content-Type', /yaml/)
        .expect(200);
});

test('exports only features as yaml', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/state/export?format=yaml&featureToggles=1')
        .expect('Content-Type', /yaml/)
        .expect(200);
});

test('exports strategies and features as attachment', async () => {
    expect.assertions(0);

    return app.request
        .get('/api/admin/state/export?download=1')
        .expect('Content-Type', /json/)
        .expect('Content-Disposition', /attachment/)
        .expect(200);
});

test('imports strategies and features', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .send(importData)
        .expect(202);
});

test('does not not accept gibberish', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .send({ features: 'nonsense' })
        .expect(400);
});

test('imports strategies and features from json file', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/import.json')
        .expect(202);
});

test('imports strategies and features from yaml file', async () => {
    expect.assertions(0);

    return app.request
        .post('/api/admin/state/import')
        .attach('file', 'src/test/examples/import.yml')
        .expect(202);
});
