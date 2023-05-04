import { IUnleashTest, setupAppWithAuth } from '../../helpers/test-helper';
import dbInit, { ITestDb } from '../../helpers/database-init';
import getLogger from '../../../fixtures/no-logger';
import { randomId } from '../../../../lib/util';
import { ApiTokenType } from '../../../../lib/types/models/api-token';

let app: IUnleashTest;
let db: ITestDb;
let appErrorLogs: string[] = [];

beforeAll(async () => {
    db = await dbInit(`proxy_concurrency`, getLogger);
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
    app.services.proxyService.stopAll();
    jest.clearAllMocks();
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

beforeEach(async () => {
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

    await Promise.all(
        Array.from(Array(15).keys()).map(() =>
            app.request
                .get('/api/frontend')
                .set('Authorization', frontendTokenDefault.secret)
                .expect('Content-Type', /json/)
                .expect(200),
        ),
    );
    expect(appErrorLogs).toHaveLength(0);
});
