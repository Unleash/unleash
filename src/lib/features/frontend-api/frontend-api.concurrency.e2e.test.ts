import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { randomId } from '../../util';
import { ApiTokenType } from '../../types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let appErrorLogs: string[] = [];

beforeAll(async () => {
    db = await dbInit('frontend_api_concurrency', getLogger);
    const baseLogger = getLogger();
    const appLogger = {
        ...baseLogger,
        error: (msg: string, ...args: any[]) => {
            appErrorLogs.push(msg);
            baseLogger.error(msg, ...args);
        },
    };
    app = await setupAppWithAuth(db.stores, {
        frontendApiOrigins: ['https://example.com'],
        getLogger: () => appLogger,
    });
});

afterEach(() => {
    console.log('Stopping all and clearing mocks');
    app.services.frontendApiService.stopAll();
    jest.clearAllMocks();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(() => {
    appErrorLogs = [];
});

/**
 * This test needs to run on a new instance of the application and a clean DB
 * which is why it should be the only test of this file
 */
test('multiple parallel calls to api/frontend should not create multiple instances', async () => {
    const frontendTokenDefault =
        await app.services.apiTokenService.createApiTokenWithProjects({
            type: ApiTokenType.FRONTEND,
            projects: ['default'],
            environment: 'default',
            tokenName: `test-token-${randomId()}`,
        });

    const promises = Array(10).fill(
        app.request
            .get('/api/frontend')
            .set('Authorization', frontendTokenDefault.secret)
            .expect('Content-Type', /json/)
            .expect(200),
    );

    const allRequests = Promise.all(promises);
    await expect(allRequests).resolves.toBeTruthy();
    expect(appErrorLogs).toHaveLength(0);
});
