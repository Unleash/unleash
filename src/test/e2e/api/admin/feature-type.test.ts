import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { setupApp } from '../../helpers/test-helper';
import { validateSchema } from '../../../../lib/openapi/validate';
import { featureTypesSchema } from '../../../../lib/openapi/spec/feature-types-schema';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('feature_type_api_serial', getLogger);
    app = await setupApp(db.stores);
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
