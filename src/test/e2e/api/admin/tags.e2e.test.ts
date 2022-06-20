import dbInit from '../../helpers/database-init';
import { setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('tag_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns list of tags', async () => {
    await app.request
        .post('/api/admin/tags')
        .send({
            value: 'Tester',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');

    return app.request
        .get('/api/admin/tags')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tags.length).toBe(1);
        });
});

test('gets a tag by type and value', async () => {
    await app.request
        .post('/api/admin/tags')
        .send({
            value: 'Tester',
            type: 'simple',
        })
        .set('Content-Type', 'application/json');
    return app.request
        .get('/api/admin/tags/simple/Tester')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tag.value).toBe('Tester');
        });
});

test('cannot get tag that does not exist', async () => {
    expect.assertions(1);

    return app.request.get('/api/admin/tags/simple/12158091').expect((res) => {
        expect(res.status).toBe(404);
    });
});

test('Can create a tag', async () =>
    app.request
        .post('/api/admin/tags')
        .send({
            value: 'TeamRed',
            type: 'simple',
        })
        .expect((res) => {
            expect(res.status).toBe(201);
        }));

test('Can validate a tag', async () =>
    app.request
        .post('/api/admin/tags')
        .send({
            value: 124,
            type: 'not url friendly',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .expect((res) => {
            expect(res.body.details.length).toBe(1);
            expect(res.body.details[0].message).toBe(
                '"type" must be URL friendly',
            );
        }));
test('Can delete a tag', async () => {
    await app.request
        .delete('/api/admin/tags/simple/Tester')
        .set('Content-Type', 'application/json')
        .expect(200);
    await new Promise((r) => setTimeout(r, 50));
    return app.request
        .get('/api/admin/tags')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(
                res.body.tags.indexOf(
                    (tag) => tag.value === 'Tester' && tag.type === 'simple',
                ),
            ).toBe(-1);
        });
});
