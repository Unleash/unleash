import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import {
    createUserWithRootRole,
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import { validateSchema } from '../../../../lib/openapi/validate.js';
import { featureTypesSchema } from '../../../../lib/openapi/spec/feature-types-schema.js';
import { RoleName } from '../../../../lib/types/index.js';

let app: IUnleashTest;
let db: ITestDb;

const adminEmail = 'admin-user@getunleash.io';

beforeAll(async () => {
    db = await dbInit('feature_type_api_serial', getLogger);
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

test('Should get all defined feature types', async () => {
    await app.request
        .get('/api/admin/feature-types')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            const { version, types } = res.body;
            expect(version).toBe(1);
            expect(types.length).toBe(5);
            expect(types[0].name).toBe('Release');
            expect(
                validateSchema(featureTypesSchema.$id, res.body),
            ).toBeUndefined();
        });
});

describe('updating lifetimes', () => {
    test.each([
        null,
        5,
    ])('it updates to the lifetime correctly: `%s`', async (lifetimeDays) => {
        const { body } = await app.request
            .put('/api/admin/feature-types/release/lifetime')
            .send({ lifetimeDays })
            .expect(200);

        expect(body.lifetimeDays).toEqual(lifetimeDays);
    });
    test("if the feature type doesn't exist, you get a 404", async () => {
        await app.request
            .put('/api/admin/feature-types/bogus-feature-type/lifetime')
            .send({ lifetimeDays: 45 })
            .expect(404);
    });

    test('Setting lifetime to `null` is the same as setting it to `0`', async () => {
        const setLifetime = async (lifetimeDays) => {
            const { body } = await app.request
                .put('/api/admin/feature-types/release/lifetime')
                .send({ lifetimeDays })
                .expect(200);
            return body;
        };

        expect(await setLifetime(0)).toMatchObject(await setLifetime(null));

        const { body } = await app.getRecordedEvents();
        expect(body.events[0]).toMatchObject({
            data: { id: 'release', lifetimeDays: null },
        });
    });
    test('the :id parameter is not case sensitive', async () => {
        const lifetimeDays = 45;
        const { body } = await app.request
            .put('/api/admin/feature-types/kIlL-SwItCh/lifetime')
            .send({ lifetimeDays })
            .expect(200);

        expect(body.lifetimeDays).toEqual(lifetimeDays);
    });
});
