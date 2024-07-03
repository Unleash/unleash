import {
    type IUnleashNoSupertest,
    setupAppWithoutSupertest,
} from '../../../test/e2e/helpers/test-helper';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { randomId } from '../../util';
import { ApiTokenType } from '../../types/models/api-token';

let app: IUnleashNoSupertest;
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
    app = await setupAppWithoutSupertest(
        db.stores,
        {
            frontendApiOrigins: ['https://example.com'],
            getLogger: () => appLogger,
        },
        db.rawDatabase,
    );
});

afterEach(() => {
    app.services.frontendApiService.stopAll();
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
    const address = app.server.address();
    expect(address).not.toBeNull();
    expect(address).toHaveProperty('port');
    // @ts-ignore - We've just checked that we have this property
    const serverUrl = `http://localhost:${address.port}/api/frontend`;
    await Promise.all(
        Array.from(Array(10).keys()).map(() =>
            fetch(serverUrl, {
                method: 'GET',
                headers: {
                    Authorization: frontendTokenDefault.secret,
                },
            }).then((res) => expect(res.status).toBe(200)),
        ),
    );
    expect(appErrorLogs).toHaveLength(0);
});
