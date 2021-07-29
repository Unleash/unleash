import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('event_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns events', async () => {
    expect.assertions(0);
    return app.request
        .get('/api/admin/events')
        .expect('Content-Type', /json/)
        .expect(200);
});

test('returns events given a name', async () => {
    expect.assertions(0);
    return app.request
        .get('/api/admin/events/myname')
        .expect('Content-Type', /json/)
        .expect(200);
});
