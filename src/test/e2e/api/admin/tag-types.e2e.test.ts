import dbInit from '../../helpers/database-init';
import { setupApp } from '../../helpers/test-helper';
import getLogger from '../../../fixtures/no-logger';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('tag_types_api_serial', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('returns list of tag-types', async () => {
    expect.assertions(1);

    return app.request
        .get('/api/admin/tag-types')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tagTypes.length).toBe(1);
        });
});

test('gets a tag-type by name', async () => {
    expect.assertions(1);

    return app.request
        .get('/api/admin/tag-types/simple')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tagType.name).toBe('simple');
        });
});

test('querying a tag-type that does not exist yields 404', async () => {
    expect.assertions(0);

    return app.request.get('/api/admin/tag-types/non-existent').expect(404);
});

test('Can create a new tag type', async () => {
    await app.request
        .post('/api/admin/tag-types')
        .send({
            name: 'slack',
            description:
                'Tag your feature toggles with slack channel to post updates for toggle to',
            icon: 'http://icons.iconarchive.com/icons/papirus-team/papirus-apps/32/slack-icon.png',
        })
        .expect(201);
    return app.request
        .get('/api/admin/tag-types/slack')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tagType.icon).toBe(
                'http://icons.iconarchive.com/icons/papirus-team/papirus-apps/32/slack-icon.png',
            );
        });
});

test('Invalid tag types gets rejected', async () => {
    await app.request
        .post('/api/admin/tag-types')
        .send({
            name: 'Something url unsafe',
            description: 'A fancy description',
            icon: 'NoIcon',
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect((res) => {
            expect(res.body.details[0].message).toBe(
                '"name" must be URL friendly',
            );
        });
});

test('Can update a tag types description and icon', async () => {
    await app.request.get('/api/admin/tag-types/simple').expect(200);
    await app.request
        .put('/api/admin/tag-types/simple')
        .send({
            description: 'new description',
            icon: '$',
        })
        .expect(200);
    return app.request
        .get('/api/admin/tag-types/simple')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tagType.icon).toBe('$');
        });
});
test('Numbers are coerced to strings for icons and descriptions', async () => {
    await app.request.get('/api/admin/tag-types/simple').expect(200);
    await app.request
        .put('/api/admin/tag-types/simple')
        .send({
            description: 15125,
            icon: 125,
        })
        .expect(200);
});

test('Validation of tag-types returns 200 for valid tag-types', async () => {
    await app.request
        .post('/api/admin/tag-types/validate')
        .send({
            name: 'something',
            description: 'A fancy description',
            icon: 'NoIcon',
        })
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect((res) => {
            expect(res.body.valid).toBe(true);
        });
});

test('Validation of tag types allows numbers for description and icons because of coercion', async () => {
    await app.request
        .post('/api/admin/tag-types/validate')
        .send({
            name: 'something',
            description: 1234,
            icon: 56789,
        })
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect((res) => {
            expect(res.body.valid).toBe(true);
        });
});
test('Invalid tag-types get refused by validator', async () => {
    await app.request
        .post('/api/admin/tag-types/validate')
        .send({
            name: 'Something url unsafe',
            description: 'A fancy description',
            icon: 'NoIcon',
        })
        .set('Content-Type', 'application/json')
        .expect(400)
        .expect((res) => {
            expect(res.body.details[0].message).toBe(
                '"name" must be URL friendly',
            );
        });
});

test('Can delete tag type', async () => {
    expect.assertions(0);

    await app.request
        .delete('/api/admin/tag-types/simple')
        .set('Content-Type', 'application/json')
        .expect(200);
    return app.request.get('/api/admin/tag-types/simple').expect(404);
});

test('Non unique tag-types gets rejected', async () => {
    await app.request
        .post('/api/admin/tag-types')
        .send({
            name: 'my-tag-type',
            description: 'Will be accepted first time',
            icon: 'T',
        })
        .set('Content-Type', 'application/json')
        .expect(201);
    return app.request
        .post('/api/admin/tag-types')
        .send({
            name: 'my-tag-type',
            description: 'Will not be accepted this time',
            icon: 'T',
        })
        .set('Content-Type', 'application/json')
        .expect((res) => {
            expect(res.status).toBe(409);
        });
});

test('Only required argument should be name', async () => {
    const name = 'some-tag-type';
    return app.request
        .post('/api/admin/tag-types')
        .send({ name, description: '' })
        .set('Content-Type', 'application/json')
        .expect(201)
        .expect((res) => {
            expect(res.body.name).toBe(name);
        });
});
