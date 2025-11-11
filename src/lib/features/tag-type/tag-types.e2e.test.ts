import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    createUserWithRootRole,
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { RoleName } from '../../types/index.js';

let app: IUnleashTest;
let db: ITestDb;

const adminEmail = 'admin-user@getunleash.io';

beforeAll(async () => {
    db = await dbInit('tag_types_api_serial', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );

    await createUserWithRootRole({
        app,
        stores: db.stores,
        email: adminEmail,
        roleName: RoleName.ADMIN,
    });
});

beforeEach(async () => {
    await app.login({ email: adminEmail });
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
                'Tag your feature flags with slack channel to post updates for flag to',
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

test('Can create a new tag type with color', async () => {
    await app.request
        .post('/api/admin/tag-types')
        .send({
            name: 'colored-tag',
            description: 'A tag type with a color',
            icon: 'icon',
            color: '#FF5733',
        })
        .expect(201);
    return app.request
        .get('/api/admin/tag-types/colored-tag')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            expect(res.body.tagType.color).toBe('#FF5733');
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
            expect(res.body.details[0].message).toMatch(
                '"name" must be URL friendly',
            );
        });
});

test('Tag type with invalid color format gets rejected', async () => {
    const res = await app.request
        .post('/api/admin/tag-types')
        .send({
            name: 'invalid-color-tag',
            description: 'A tag with invalid color',
            color: 'not-a-color',
        })
        .set('Content-Type', 'application/json')
        .expect(400);

    expect(res.body.details[0].message).toBe(
        'must match pattern "^#[0-9A-Fa-f]{6}$"',
    );
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

test('Can update a tag type color', async () => {
    await app.request
        .post('/api/admin/tag-types')
        .send({
            name: 'color-update-tag',
            description: 'A tag type to test color updates',
            color: '#FFFFFF',
        })
        .expect(201);

    await app.request
        .put('/api/admin/tag-types/color-update-tag')
        .send({
            color: '#00FF00',
        })
        .expect(200);

    const res = await app.request
        .get('/api/admin/tag-types/color-update-tag')
        .expect('Content-Type', /json/)
        .expect(200);

    expect(res.body.tagType.color).toBe('#00FF00');
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

test('Validation of tag-types with valid color is successful', async () => {
    const res = await app.request
        .post('/api/admin/tag-types/validate')
        .send({
            name: 'color-validation',
            description: 'A tag type with a valid color',
            color: '#123ABC',
        })
        .set('Content-Type', 'application/json')
        .expect(200);

    expect(res.body.valid).toBe(true);
});

test('Validation of tag-types with invalid color format is unsuccessful', async () => {
    const res = await app.request
        .post('/api/admin/tag-types/validate')
        .send({
            name: 'invalid-color-validation',
            description: 'A tag type with an invalid color',
            color: 'not-a-color',
        })
        .set('Content-Type', 'application/json')
        .expect(400);

    expect(res.body.details[0].message).toBe(
        'must match pattern "^#[0-9A-Fa-f]{6}$"',
    );
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
            expect(res.body.details[0].message).toMatch(
                '"name" must be URL friendly',
            );
        });
});

test('Can delete tag type', async () => {
    await app.request
        .delete('/api/admin/tag-types/simple')
        .set('Content-Type', 'application/json')
        .expect(200);
    await app.request.get('/api/admin/tag-types/simple').expect(404);

    const { body } = await app.getRecordedEvents();
    expect(body.events[0].preData).toMatchObject({ name: 'simple' });
    expect(body.events[0].data).toBe(null);
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

test('Creating a tag type with null color is allowed', async () => {
    const name = 'null-color-tag';
    const res = await app.request
        .post('/api/admin/tag-types')
        .send({
            name,
            description: 'A tag with null color',
            color: null,
        })
        .set('Content-Type', 'application/json')
        .expect(201);

    expect(res.body.name).toBe(name);
    expect(res.body.color).toBe(null);
});
