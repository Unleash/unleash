import { setupApp } from '../../helpers/test-helper';
import dbInit from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import enforcer from 'openapi-enforcer';

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
            // The version field is not set when running jest without yarn/npm.
            delete res.body.info.version;
            // This test will fail whenever there's a change to the API spec.
            // If the change is intended, update the snapshot with `jest -u`.
            expect(res.body).toMatchSnapshot();
        });
});

// test('the generated OpenAPI should not have any warnings', async () => {
//     const { body } = await app.request
//         .get('/docs/openapi.json')
//         .expect('Content-Type', /json/)
//         .expect(200);

//     const [_openapi, _error, warning] = await enforcer(body, {
//         fullResult: true,
//     });

//     if (warning !== undefined) console.warn(warning);

//     expect(warning).toBeFalsy();
// });

test('the generated OpenAPI spec is valid', async () => {
    const { body } = await app.request
        .get('/docs/openapi.json')
        .expect('Content-Type', /json/)
        .expect(200);

    const [openapi, error] = await enforcer(body, {
        fullResult: true,
    });

    if (error !== undefined) console.error(error);

    expect(openapi).toBeTruthy();
});
