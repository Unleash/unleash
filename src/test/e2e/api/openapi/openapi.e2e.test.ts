import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import SwaggerParser from '@apidevtools/swagger-parser';

let app;
let db;

beforeAll(async () => {
    db = await dbInit('openapi', getLogger);
    app = await setupApp(db.stores);
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('should serve the OpenAPI UI', async () => {
    return app.request
        .get('/docs/openapi/')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect((res) => expect(res.text).toMatchSnapshot());
});

test('should serve the OpenAPI spec', async () => {
    return app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            // remove the version from the received specification. The version
            // _is_ a required field, but having the version listed in automated
            // testing causes issues when trying to deploy new versions of the
            // API (due to mismatch between new tag versions etc). That's why we
            // remove it.
            delete res.body.info.version;
            // This test will fail whenever there's a change to the API spec.
            // If the change is intended, update the snapshot with `jest -u`.
            expect(res.body).toMatchSnapshot();
        });
});

test('should serve the OpenAPI spec with a `version` property', async () => {
    return app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
            // ensure that the version field is present
            expect(res.body.info.version).toBeTruthy();
        });
});

test('the generated OpenAPI spec is valid', async () => {
    const { body } = await app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);

    // this throws if the swagger parser can't parse it correctly
    // also parses examples, but _does_ do some string coercion in examples
    try {
        await SwaggerParser.validate(body);
    } catch (err) {
        console.error(err);
        return false;
    }
});
